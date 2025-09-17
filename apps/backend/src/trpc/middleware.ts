import { TRPCError } from '@trpc/server';
import { t } from './init';

export const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx });
});

export const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only Admins have access to this route',
    });
  }

  return next({ ctx });
});
