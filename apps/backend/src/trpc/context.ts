import type { Profile, User } from '@repo/db';
import { Request, Response } from 'express';
import { prisma } from '@repo/db';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { IncomingMessage } from 'http';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';

interface BaseContext {
  user?: User;
  prisma: typeof prisma;
}

// Express
interface HTTPContext extends BaseContext {
  req: Request;
  res: Response;
}

interface WSContext extends BaseContext {
  req: IncomingMessage;
}

export type Context = HTTPContext | WSContext;

export function createContext({
  req,
  res,
}: CreateExpressContextOptions): HTTPContext {
  return {
    req,
    res,
    user: req.user as User,
    prisma,
  };
}

export function createWSSContext({
  req,
}: CreateWSSContextFnOptions): WSContext {
  return {
    req,
    user: undefined, // TODO: implement ws auth logic?
    prisma,
  };
}
