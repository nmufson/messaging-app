import {
  eventEmitter
} from "./chunk-5FOY4D7E.mjs";
import {
  logger
} from "./chunk-6VGUZGDJ.mjs";
import {
  adminProcedure,
  userProcedure
} from "./chunk-ZAYRUBIM.mjs";
import {
  router
} from "./chunk-XI2LZ4T3.mjs";

// src/routers/chat.ts
import { ObjectId } from "@common/schemas/primitives";
import { tracked, TRPCError } from "@trpc/server";
import { on } from "events";
import { z } from "@common";
import { mergeAsyncIterators } from "@common/utils/mergeAsyncIterators";
import { UserRole } from "@common/schemas/user";
import { ChatDTO, ChatType } from "@common/schemas/chat";
var chatRouter = router({
  byId: userProcedure.input(
    z.object({
      chatId: ObjectId,
      limit: z.number().default(100),
      cursor: ObjectId.optional()
    })
  ).query(async ({ ctx, input }) => {
    const { chatId, limit, cursor } = input;
    const chat = await ctx.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          take: limit,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : void 0,
          orderBy: { createdAt: "desc" },
          select: {
            type: true,
            content: true,
            imageUrl: true,
            senderId: true
          }
        },
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true
          }
        }
      }
    });
    if (!chat) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chat not found"
      });
    }
    return chat;
  }),
  onNewMessageInChat: userProcedure.input(
    z.object({
      profileId: ObjectId
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { profileId } = input;
    const { user } = ctx;
    if (user.id !== profileId && user.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const profile = await ctx.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        chats: {
          select: {
            id: true
          }
        }
      }
    });
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    const iterables = profile.chats.map(
      ({ id }) => on(eventEmitter, `addMessageToChat:${id}`, { signal })
    );
    for await (const [message] of mergeAsyncIterators(iterables)) {
      yield tracked(message.id, message);
    }
  }),
  onNewChat: userProcedure.input(
    z.object({
      profileId: ObjectId
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { profileId } = input;
    const { user } = ctx;
    if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    for await (const [newChat] of on(eventEmitter, `newChat:${profileId}`, {
      signal
    })) {
      yield tracked(newChat.id, newChat);
    }
  }),
  getList: userProcedure.input(
    z.object({
      profileId: z.string(),
      limit: z.number().default(100)
    })
  ).query(async ({ input, ctx }) => {
    const { profileId, limit } = input;
    const { user } = ctx;
    if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not allowed to view this profile's chat"
      });
    }
    const profile = await ctx.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        chats: {
          take: limit,
          orderBy: { updatedAt: "desc" },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              // for displaying most recent msg in list
              select: {
                content: true
              },
              include: {
                sender: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            participants: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true
              }
            }
          }
        }
      }
    });
    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found"
      });
    }
    return profile.chats;
  }),
  // TODO: move this to an admin router??
  getAll: adminProcedure.input(
    z.object({
      limit: z.number().default(100)
    })
  ).output(ChatDTO.array()).query(async ({ ctx }) => {
    logger.info("Requesting all chats");
    const chats = await ctx.prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          // display most recent msg in preview
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    const transformedChats = chats.map((chat) => ({
      id: chat.id,
      type: chat.type,
      createdAt: chat.createdAt.toISOString(),
      // ✅ Convert Date to string
      updatedAt: chat.updatedAt?.toISOString(),
      // ✅ Convert Date to string
      participants: chat.participants,
      lastMessage: chat.messages[0] ? {
        content: chat.messages[0].content || "",
        sender: chat.messages[0].sender
      } : void 0,
      name: chat.name,
      groupPictureUrl: chat.groupPictureUrl,
      creator: chat.creator
    }));
    console.log("Transformed chats sample:", transformedChats[0]);
    return transformedChats;
  }),
  createGroup: userProcedure.input(
    z.object({
      creator: ObjectId,
      participants: ObjectId.array()
    })
  ).mutation(async ({ input, ctx }) => {
    const { creator, participants } = input;
    const chat = await ctx.prisma.chat.create({
      data: {
        creatorId: creator,
        type: ChatType.enum.GROUP,
        participants: {
          connect: participants.map((id) => ({ id }))
        }
      }
    });
    participants.forEach((userId) => {
      eventEmitter.emit(`newChat:${userId}`, chat);
    });
    return chat;
  })
});

export {
  chatRouter
};
