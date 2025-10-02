import { publicProcedure, router, userProcedure } from '../trpc';
import { getUserByEmail } from '../services/user';
import passport from 'passport';
import type { User } from 'express';
import { LogInInput, RegisterInput } from '@common/schemas/auth';
import { hashPassword } from '../services/hash';
import { TRPCError } from '@trpc/server';

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
        console.log(user, 'User created successfully!');
        return { user };
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
    }),
  login: publicProcedure.input(LogInInput).mutation(async ({ input, ctx }) => {
    return new Promise((resolve, reject) => {
      if ('body' in ctx.req) {
        ctx.req.body = {
          email: input.email,
          password: input.password,
        };
      }
      passport.authenticate('local', (err: Error, user: User, info: object) => {
        if (err) return reject(err);
        if (!user) return reject(new Error('Invalid credentials'));
        // !
        // TODO: figure out better way to handle this
        // !
        if ('login' in ctx.req) {
          ctx.req.login(user, (err: Error) => {
            if (err) return reject(err);
            resolve({ user });
          });
        } else {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Request object does not support login',
          });
        }
      })(ctx.req, 'res' in ctx ? ctx.res : undefined);
    });
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    // !
    // TODO: figure out better way to handle this
    // !
    if ('logout' in ctx.req && typeof ctx.req.logout === 'function') {
      ctx.req.logout(() => {});
      return { success: true };
    } else {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Request object does not support logout',
      });
    }
  }),
  me: userProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return ctx.user;
  }),
});
