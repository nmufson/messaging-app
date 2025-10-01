import { ObjectId } from '@common/schemas/primitives';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { z } from '@common';
import { eventEmitter } from '../lib/eventBus';
import { handleTRPCError } from '../services/error';
import {
  adminProcedure,
  publicProcedure,
  router,
  userProcedure,
} from '../trpc';
import { mergeAsyncIterators } from '@common/utils/mergeAsyncIterators';
import { UserRole } from '@common/schemas/user';
import { ChatType } from '@common/schemas/chat';

export const chatRouter = router({
  byId: userProcedure
    .input(
      z.object({
        chatId: ObjectId,
        limit: z.number().default(100),
        cursor: ObjectId.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { chatId, limit, cursor } = input;

      const chat = await ctx.prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            select: {
              type: true,
              content: true,
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

      return chat;
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
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx }) => {
      try {
        const chats = await ctx.prisma.chat.findMany({
          take: 30,
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
        });
        return { chats };
      } catch (err) {
        handleTRPCError(err, 'Failed to retrieve chats');
      }
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
          creator,
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
