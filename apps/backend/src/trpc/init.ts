import { initTRPC } from '@trpc/server';
import { superjson } from '@repo/common';
import { Context } from './context';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
