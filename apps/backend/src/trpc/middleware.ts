import { TRPCError } from '@trpc/server';
import { t } from './init';

export const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be an admin to access this route',
    });
  }

  return next({ ctx });
});
