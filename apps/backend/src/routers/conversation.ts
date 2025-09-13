import z from 'zod';
import { publicProcedure, router } from '../trpc';

export const conversationRouter = router({
  getProfileConversations: publicProcedure
    .input(
      z.object({
        profileId: z.string(),
        limit: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const { profileId, limit } = input;

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
              profiles: true,
            },
          },
        },
      });

      if (!profile) {
        // return an error
        // TODO: figure out error handling
        return;
      }

      return profile.conversations;
    }),

  // startConversation: publicProcedure
  //   .input(z.object({
  //     senderId: z.string(),

  //   }))
});
