import {
  profileProcedure,
  publicProcedure,
  router,
  userProcedure,
} from '../trpc';
import { getUserByEmail } from '../services/user';
import passport from 'passport';
import type { User } from '@repo/db';
import { LogInInput, RegisterInput } from '@repo/common';
import { hashPassword } from '../services/hash';
import { TRPCError } from '@trpc/server';
import { AuthUserDTO } from '@repo/common';

function isExpressRequest(req: unknown) {
  return req !== null && typeof req === 'object' && 'login' in req;
}

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

      passport.authenticate('local', (err: Error, user: User) => {
        if (err) return reject(err);
        if (!user) return reject(new Error('Invalid credentials'));

        req.login(user, (err: Error) => {
          if (err) return reject(err);
          resolve({ user });
        });
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
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

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

    if (!user?.profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found or related profile is missing',
      });
    }

    return { ...user, profile: user.profile };
  }),
});
