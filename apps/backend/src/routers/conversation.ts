import z from 'zod';
import { publicProcedure, router, userProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { handleTRPCError } from '../utils/error';
import { ConversationType } from '@common/schemas/conversation';
import { MessageType } from '@common/schemas/message';

export const conversationRouter = router({
  getProfileConversations: userProcedure
    .input(
      z.object({
        profileId: z.string(),
        limit: z.number().default(30),
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
              },
              // ! make sure we're not returning all profile info
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
    .query(async ({ ctx }) => {
      try {
        const conversations = await ctx.prisma.profile.findMany({});
        return { conversations };
      } catch (err) {
        handleTRPCError(err, 'Failed to retrieve conversations');
      }
    }),

  startConversation: userProcedure
    // If theres an iniitalMessage, call newMessage helper
    .input(
      z.object({
        creator: z.string(),
        convoType: ConversationType,
        participants: z.string().array(),
        initialMessage: z
          .object({
            message: z.string(),
            type: MessageType,
          })
          .nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { creator, convoType, participants, initialMessage } = input;

      const newConvo = await ctx.prisma.$transaction(async (tx) => {
        const convo = await tx.conversation.create({
          data: {
            creator,
            type: convoType,
            participants: {
              connect: participants.map((id) => ({ id })),
            },
          },
        });

        if (initialMessage) {
          await tx.message.create({
            data: {
              conversationId: convo.id,
              senderId: creator,
              content: initialMessage.message,
              type: initialMessage.type,
            },
          });
        }

        return convo;
      });
    }),
});
