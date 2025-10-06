// src/routers/chat.ts
import { ObjectId } from "@common/schemas/primitives";
import { tracked, TRPCError as TRPCError2 } from "@trpc/server";
import { on } from "events";
import { z } from "@common";

// src/lib/eventBus.ts
import EventEmitter from "events";
var eventEmitter = new EventEmitter();

// src/trpc/context.ts
import { prisma } from "@db";

// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
import { superjson } from "@common";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;

// src/trpc/middleware.ts
import { TRPCError } from "@trpc/server";
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be an admin to access this route"
      });
    }
    return next({ ctx });
  }
);

// src/trpc/procedures.ts
var publicProcedure = t.procedure;
var userProcedure = t.procedure.use(isAuthed);
var adminProcedure = t.procedure.use(isAuthed).use(isAdmin);

// src/routers/chat.ts
import { mergeAsyncIterators } from "@common/utils/mergeAsyncIterators";
import { UserRole } from "@common/schemas/user";
import { ChatDTO, ChatType } from "@common/schemas/chat";

// src/lib/pino.ts
import pino from "pino";
var isDev = process.env.NODE_ENV === "development";
var logger = pino({
  level: isDev ? "debug" : "info",
  ...isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
      }
    }
  },
  ...process.env.NODE_ENV === "production" && {
    formatters: {
      level: (label) => ({ level: label })
    }
  }
});

// src/routers/chat.ts
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
      throw new TRPCError2({
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
    if (!user) throw new TRPCError2({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== "ADMIN") {
      throw new TRPCError2({ code: "FORBIDDEN" });
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
      throw new TRPCError2({ code: "NOT_FOUND" });
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
    if (!user) throw new TRPCError2({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
      throw new TRPCError2({ code: "FORBIDDEN" });
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
    if (!user) throw new TRPCError2({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
      throw new TRPCError2({
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
      throw new TRPCError2({
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
          select: {
            content: true,
            createdAt: true,
            type: true,
            sender: {
              select: {
                firstName: true,
                lastName: true,
                profilePictureUrl: true
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
            lastName: true,
            profilePictureUrl: true
          }
        }
      }
    });
    return chats;
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
//# sourceMappingURL=chat.mjs.map