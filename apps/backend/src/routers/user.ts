import { z } from '@repo/common';
import { TRPCError } from '@trpc/server';

import { adminProcedure, router } from '../trpc';

export const userRouter = router({
  getUserById: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      const user = await ctx.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user found with this id',
        });
      }

      return user;
    }),
  getUserByEmail: adminProcedure
    .input(z.object({ email: z.email() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user found with this email',
        });
      }
      return user;
    }),
});
