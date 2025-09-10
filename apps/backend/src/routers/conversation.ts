import z from 'zod';
import { publicProcedure, router } from '../trpc';

export const conversationRouter = router({
  getProfileConversations: publicProcedure
    .input(
      z.object({
        profileId: z.string(),
        limit: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {}),

  // startConversation: publicProcedure
  //   .input(z.object({
  //     senderId: z.string(),

  //   }))
});
