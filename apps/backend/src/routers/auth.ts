import z from 'zod';
import { publicProcedure, router } from '../trpc';
import { getUserByEmail } from '../utils/user';
import passport from 'passport';
import type { User } from 'express';
import { LoginInput, RegisterInput } from '@/packages/common/schemas/auth';
import { hashPassword } from '../utils/hash';

export const authRouter = router({
  register: publicProcedure
    .input(RegisterInput)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        // TODO: throw error
      }

      const hashedPassword = await hashPassword(password);

      const user = await ctx.prisma.user.create({
        data: {
          email,
          hashedPassword,
        },
      });

      // const token = signJwt(user.id);
      return { user };
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
});
