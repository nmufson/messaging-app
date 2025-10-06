import { initTRPC } from '@trpc/server';
import { superjson } from '@common';
import { Context } from './context';
import { DateTime } from 'luxon';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
