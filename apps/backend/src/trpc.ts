import { initTRPC } from '@trpc/server';
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import prisma from '@/packages/db';

export function createContext({ req, res }: CreateExpressContextOptions) {
  return { req, res, prisma };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

