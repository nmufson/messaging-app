import { router, publicProcedure, userProcedure } from '../trpc';
import { z } from 'zod';
import { handleTRPCError } from '../utils/error';
import { getUserByEmail, getUserById } from '../utils/user';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getUserById: userProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      try {
        const user = getUserById(userId);

        return { user };
      } catch (err) {
        handleTRPCError(err, 'Failed to retrieve user');
      }
    }),
  getUserByEmail: userProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user found with this email',
        });
      }
      return user;
    }),
  // TODO: move this to profile
  getFriendsOfUser: userProcedure
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
