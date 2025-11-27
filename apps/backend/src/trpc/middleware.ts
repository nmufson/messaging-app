import { TRPCError } from '@trpc/server';
import { t } from './init';
import type { UserWithProfile, UserWithOptionalProfile } from './context';

export const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      user: ctx.user as UserWithOptionalProfile,
    },
  });
});

/**
 * Ensures user has a profile.
 * Required for most of app functionality (chatting, friend requests, etc.).
 */
export const hasProfile = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.user.profile) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Profile required. Please create your profile first.',
    });
  }

  return next({
    ctx: {
      user: ctx.user as UserWithProfile,
    },
  });
});

export const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.user.profile) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Profile required',
    });
  }

  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({
    ctx: {
      user: ctx.user as UserWithProfile,
    },
  });
});
