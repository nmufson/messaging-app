import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  getUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      return user;
    }),
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      return user;
    }),
  getFriendsOfUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      const friendsOfUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          friends: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
            },
          },
        },
      });

      return friendsOfUser;
    }),
});
