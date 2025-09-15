import z from 'zod';
import { publicProcedure, router, userProcedure } from '../trpc';
import { getUserByEmail } from '../services/user';
import passport from 'passport';
import type { User } from 'express';
import { LoginInput, RegisterInput } from '@/packages/common/schemas/auth';
import { hashPassword } from '../services/hash';
import { TRPCError } from '@trpc/server';
import { messageRouter } from './message';

export const authRouter = router({
  register: publicProcedure
    .input(RegisterInput)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already in use',
        });
      }

      const hashedPassword = await hashPassword(password);

      try {
        const user = await ctx.prisma.user.create({
          data: {
            email,
            hashedPassword,
          },
        });
        return { user };
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
    }),
  login: publicProcedure.input(LoginInput).mutation(async ({ input, ctx }) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('local', (err: Error, user: User, info: object) => {
        if (err) return reject(err);
        if (!user) return reject(new Error('Invalid credentials'));

        ctx.req.login(user, (err: Error) => {
          if (err) return reject(err);
          resolve({ user });
        });
      })(ctx.req, ctx.res);
    });
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.req.logout(() => {});
    return { success: true };
  }),
  me: userProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return ctx.user;
  }),
});
