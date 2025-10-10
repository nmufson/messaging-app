import { ObjectId } from '@common/src/schemas/primitives';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { z } from '@common';
import { eventEmitter } from '../lib/eventBus';
import { handleTRPCError } from '../services/error';
import { adminProcedure, router, userProcedure } from '../trpc';
import { mergeAsyncIterators } from '@repo/common/utils/mergeAsyncIterators';
import { UserRole } from '@common/src/schemas/user';
import { ChatDTO, ChatType } from '@common/src/schemas/chat';
import { logger } from '../lib/pino';
import { Chat } from '@db';

export const chatRouter = router({
  // TODO: add something for loading more messages in chat
  byId: userProcedure
    .input(
      z.object({
        chatId: ObjectId,
        limit: z.number().default(100),
        cursor: ObjectId.optional(),
      })
    )
    .output(ChatDTO)
    .query(async ({ ctx, input }) => {
      const { chatId, limit, cursor } = input;

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
          messages: {
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
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
          participants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
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
      console.log(chat);
      const validatedChat = ChatDTO.parse(chat);
      return validatedChat;
    }),
  onNewMessageInChat: userProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const { profileId } = input;
      const { user } = ctx;

      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if (user.id !== profileId && user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          chats: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const iterables = profile.chats.map(({ id }) =>
        on(eventEmitter, `addMessageToChat:${id}`, { signal })
      );

      for await (const [message] of mergeAsyncIterators(iterables)) {
        yield tracked(message.id, message);
      }
    }),
  onNewChat: userProcedure
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
  getList: userProcedure
    .input(
      z.object({
        profileId: z.string(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { profileId, limit } = input;
      const { user } = ctx;

      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Not allowed to view this profile's chat",
        });
      }

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          chats: {
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1, // for displaying most recent msg in list
                select: {
                  content: true,
                },
                include: {
                  sender: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              participants: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }
      return profile.chats;
    }),
  // TODO: move this to an admin router??
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    // .output(ChatDTO.array())
    .query(async ({ ctx }) => {
      logger.info('Requesting all chats');

      const chats = await ctx.prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          // messages: {
          //   orderBy: { createdAt: 'desc' },
          //   take: 1, // display most recent msg in preview
          //   select: {
          //     id: true,
          //     type: true,
          //     content: true,
          //     imageUrl: true,
          //     createdAt: true,
          //     updatedAt: true,
          //     senderId: true,
          //   },
          // },
          participants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
            },
          },
        },
      });
      logger.info({ chats }, 'Queried all chats');
      const validatedChats: ChatDTO[] = chats.map((chat) =>
        ChatDTO.parse(chat)
      );

      return { message: 'test' };
    }),

  createGroup: userProcedure
    .input(
      z.object({
        creator: ObjectId,
        participants: ObjectId.array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { creator, participants } = input;

      const chat = await ctx.prisma.chat.create({
        data: {
          creatorId: creator,
          type: ChatType.enum.GROUP,
          participants: {
            connect: participants.map((id) => ({ id })),
          },
        },
      });

      participants.forEach((userId) => {
        eventEmitter.emit(`newChat:${userId}`, chat);
      });

      return chat;
    }),
});
