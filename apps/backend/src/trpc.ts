import { initTRPC } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { prisma } from '@db';
import type { IncomingMessage } from 'http';

// ? organize this into separate files

export function createContext({ req, res }: CreateExpressContextOptions) {
  return { req, res, user: req.user, prisma };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
