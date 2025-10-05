import { User, Request, Response } from 'express';
import { prisma } from '@db';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { IncomingMessage } from 'http';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';

interface BaseContext {
    user?: User;
    prisma: typeof prisma;
}
interface HTTPContext extends BaseContext {
    req: Request;
    res: Response;
}
interface WSContext extends BaseContext {
    req: IncomingMessage;
}
type Context = HTTPContext | WSContext;
declare function createContext({ req, res, }: CreateExpressContextOptions): HTTPContext;
declare function createWSSContext({ req, }: CreateWSSContextFnOptions): WSContext;

export { type Context, createContext, createWSSContext };
