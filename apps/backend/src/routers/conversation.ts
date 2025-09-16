import z from 'zod';
import { publicProcedure, router, userProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { handleTRPCError } from '../services/error';
import { ConversationType } from '@common/schemas/conversation';
import { MessageType } from '@common/schemas/message';

export const conversationRouter = router({
  // ? implement streaming/subscription here??
  getConversation: userProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().default(100),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { conversationId, limit, cursor } = input;

      const conversation = await ctx.prisma.conversation.findUnique({
        where: { id: conversationId },
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

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      return { conversation };
    }),
  getProfileConversations: userProcedure
    .input(
      z.object({
        profileId: z.string(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { profileId, limit } = input;
      const { user } = ctx;
      if (user?.id !== profileId && user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Not allowed to view this profile's conversation",
        });
      }

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          conversations: {
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
      return profile.conversations;
    }),
  getAllConversations: publicProcedure // TODO: change this to admin
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx }) => {
      try {
        const conversations = await ctx.prisma.conversation.findMany({
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
        return { conversations };
      } catch (err) {
        handleTRPCError(err, 'Failed to retrieve conversations');
      }
    }),

  startGroupConversation: userProcedure
    .input(
      z.object({
        creator: z.string(),
        participants: z.string().array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { creator, participants } = input;

      const convo = await ctx.prisma.conversation.create({
        data: {
          creator,
          type: 'GROUP',
          participants: {
            connect: participants.map((id) => ({ id })),
          },
        },
      });
    }),
});
