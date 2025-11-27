import { publicProcedure, router, userProcedure } from '../trpc';
import { getUserByEmail } from '../services/user';
import passport from 'passport';
import type { User } from '@repo/db';
import { CreateUserInput, LogInUserInput } from '@repo/common';
import { hashPassword } from '../services/hash';
import { TRPCError } from '@trpc/server';
import { AuthUserDTO } from '@repo/common';
import type { Request } from 'express';
import { loginUser } from '@/services/auth';

function isExpressRequest(req: unknown): req is Request {
  return req !== null && typeof req === 'object' && 'login' in req;
}

export const authRouter = router({
  register: publicProcedure
    .input(CreateUserInput)
    .mutation(async ({ input, ctx }) => {
      if (!isExpressRequest(ctx.req)) {
        throw new TRPCError({
          code: 'METHOD_NOT_SUPPORTED',
          message: 'Register is only available over HTTP',
        });
      }

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

        // Auto-login the user after registration
        return await loginUser({ req: ctx.req, user });
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
    }),
  login: publicProcedure
    .input(LogInUserInput)
    .mutation(async ({ input, ctx }) => {
      if (!isExpressRequest(ctx.req)) {
        throw new TRPCError({
          code: 'METHOD_NOT_SUPPORTED',
          message: 'Login is only available over HTTP',
        });
      }

      const req = ctx.req;

      return new Promise((resolve, reject) => {
        req.body = {
          email: input.email,
          password: input.password,
        };

        passport.authenticate('local', async (err: Error, user: User) => {
          if (err) return reject(err);
          if (!user) return reject(new Error('Invalid credentials'));

          try {
            const result = await loginUser({ req, user });
            resolve(result);
          } catch (loginErr) {
            reject(loginErr);
          }
        })(req, 'res' in ctx ? ctx.res : undefined);
      });
    }),

  logout: userProcedure.mutation(({ ctx }) => {
    if (!isExpressRequest(ctx.req)) {
      throw new TRPCError({
        code: 'METHOD_NOT_SUPPORTED',
        message: 'Logout is only available over HTTP',
      });
    }

    ctx.req.logout(() => {});
    return { success: true };
  }),
  me: userProcedure.output(AuthUserDTO).query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }

    return { ...user, profile: user?.profile || null };
  }),
});
