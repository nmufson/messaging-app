import {
  getChat,
  getMergedActivities,
  getPotentialChats,
} from '@/services/chat';
import { sendMessage } from '@/services/message';
import {
  BaseProfileDTO,
  ChatDTO,
  ChatInfoDTO,
  ChatListItemDTO,
  ChatType,
  mergeAsyncIterators,
  MessageType,
  ObjectId,
  tagActivity,
  UserRole,
  z,
} from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { eventEmitter } from '../lib/eventBus';
import { logger } from '../lib/pino';
import { adminProcedure, profileProcedure, router } from '../trpc';

export const chatRouter = router({
  byId: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
      })
    )
    .output(ChatInfoDTO)
    .query(async ({ ctx, input }) => {
      const { chatId } = input;

      const chat = await getChat(ctx.prisma, { chatId });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

      return chat;
    }),

  findChat: profileProcedure
    .input(
      z.object({
        chatId: ObjectId.optional(),
        profileIds: ObjectId.array().optional(),
      })
    )
    .output(ChatInfoDTO)
    .query(async ({ ctx, input }) => {
      const { chatId, profileIds } = input;
      const { prisma, user } = ctx;

      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      if (!chatId && (!profileIds || profileIds.length === 0)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Must provide chatId or profileIds',
        });
      }

      let chat;
      if (chatId) {
        chat = await getChat(prisma, { chatId });
      } else if (profileIds && profileIds.length > 0) {
        chat = await getChat(prisma, {
          profileIds: [...profileIds, userProfileId],
        });
      }

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }
      return chat;
    }),

  onNewChat: profileProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const { profileId } = input;
      const { user } = ctx;

      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      for await (const [newChat] of on(eventEmitter, `newChat:${profileId}`, {
        signal,
      })) {
        yield tracked(newChat.id, newChat);
      }
    }),
  getList: profileProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .output(ChatDTO.array())
    .query(async ({ input, ctx }) => {
      const { limit } = input;
      const { user } = ctx;
      const profileId = user.profile.id;

      const chats = await ctx.prisma.chat.findMany({
        where: {
          participants: {
            some: { profileId },
          },
        },
        // TODO: can use unit pagination w cursor here
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              chatId: true,
              type: true,
              content: true,
              imageUrl: true,
              createdAt: true,
              updatedAt: true,
              senderId: true,
            },
          },
          actions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              chatId: true,
              actionType: true,
              targetId: true,
              createdAt: true,
              content: true,
              actorId: true,
            },
          },
          participants: {
            where: {
              status: 'MEMBER',
            },
            select: {
              lastViewedAt: true,
              unreadActivities: true,
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (!chats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chats not found',
        });
      }

      const chatsWithActivities = await Promise.all(
        chats.map(async (chat) => {
          const activities = await getMergedActivities(
            chat.messages,
            chat.actions
          );
          return {
            ...chat,
            activities,
          };
        })
      );

      return chatsWithActivities;
    }),
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .output(ChatDTO.array())
    .query(async ({ ctx }) => {
      logger.info('Requesting all chats');

      const chats = await ctx.prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // display most recent msg in preview
            select: {
              id: true,
              type: true,
              content: true,
              imageUrl: true,
              createdAt: true,
              updatedAt: true,
              senderId: true,
            },
          },
          participants: {
            where: {
              status: 'MEMBER',
            },
            select: {
              lastViewedAt: true,
              unreadActivities: true,
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
      logger.info({ chats }, 'Queried all chats');

      const validatedChats: ChatDTO[] = chats.map((chat) =>
        ChatDTO.parse(chat)
      );
      return validatedChats;
    }),
  getPotentialChats: profileProcedure
    .input(
      z.object({
        searchNames: z.string().array(),
        requireInput: z.boolean().optional(),
        selectedProfiles: ObjectId.array().optional(),
      })
    )
    .output(
      z.object({
        profiles: BaseProfileDTO.array(),
        groupChats: ChatListItemDTO.array(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { searchNames, requireInput, selectedProfiles } = input;
      const { user } = ctx;

      const { profiles, groupChats } = await getPotentialChats(ctx.prisma, {
        profileId: user.profile.id,
        searchNames,
        requireInput,
        selectedProfiles,
      });

      return { profiles, groupChats };
    }),
  create: profileProcedure
    .input(
      z.object({
        creator: ObjectId,
        participants: ObjectId.array(),
        type: ChatType,
        firstMessage: z
          .object({
            type: MessageType,
            content: z.string().nullable(),
            imageUrl: z.string().nullable(),
          })
          .optional(),
      })
    )
    .output(ChatDTO)
    .mutation(async ({ input, ctx }) => {
      const { creator, participants, type, firstMessage } = input;

      const existingChat = await getChat(ctx.prisma, {
        profileIds: participants,
      });

      if (existingChat) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Chat with these participants already exists',
        });
      }

      const newChat = await ctx.prisma.$transaction(async (trx) => {
        const createdChat = await trx.chat.create({
          data: { creatorId: creator, type },
        });

        await trx.chatParticipant.createMany({
          data: participants.map((profileId) => ({
            chatId: createdChat.id,
            profileId,
            role: 'MEMBER',
          })),
        });

        return trx.chat.findUniqueOrThrow({
          where: { id: createdChat.id },
          include: {
            participants: {
              select: {
                lastViewedAt: true,
                unreadActivities: true,
                profile: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                type: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                imageUrl: true,
                senderId: true,
              },
            },
          },
        });
      });

      const sender = await ctx.prisma.profile.findUnique({
        where: { id: creator },
      });

      if (!sender) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sender profile not found',
        });
      }

      const createdChatAction = await ctx.prisma.chatAction.create({
        data: {
          chatId: newChat.id,
          actionType: 'CHAT_CREATED',
          actorId: creator,
        },
        select: {
          id: true,
          chatId: true,
          actionType: true,
          actorId: true,
          targetId: true,
          createdAt: true,
          content: true,
        },
      });

      participants.forEach((userId) => {
        eventEmitter.emit(`newChat:${userId}`, newChat);
      });

      let messages = [];
      if (firstMessage) {
        const newMessage = await sendMessage(ctx.prisma, {
          type: firstMessage.type,
          content: firstMessage.content,
          imageUrl: firstMessage.imageUrl,
          sender: creator,
          chatId: newChat.id,
        });
        messages.push(newMessage);
      }

      const mergedActivities = await getMergedActivities(messages, [
        createdChatAction,
      ]);

      const fullChat = {
        ...newChat,
        activities: mergedActivities,
      };

      return fullChat;
    }),
  getInfo: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
      })
    )
    .output(ChatInfoDTO)
    .query(async ({ input, ctx }) => {
      const { chatId } = input;

      const chat = await ctx.prisma.chat.findUnique({
        where: { id: chatId },
        select: {
          id: true,
          type: true,
          name: true,
          groupPictureUrl: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          participants: {
            select: {
              lastViewedAt: true,
              unreadActivities: true,
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

      return chat;
    }),
});
