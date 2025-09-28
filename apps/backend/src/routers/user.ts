import { TRPCError } from '@trpc/server';
import { z } from '@quickChat/common';
import { handleTRPCError } from '../services/error';
import { getUserByEmail, getUserById } from '../services/user';
import { router, userProcedure } from '../trpc';

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
});
