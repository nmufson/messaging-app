import * as _trpc_server from '@trpc/server';
import { superjson } from '@common';
import { Context } from './context.js';
import 'express';
import '@db';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const t: _trpc_server.TRPCRootObject<Context, object, {
    transformer: typeof superjson;
}, {
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: true;
}>;
declare const router: _trpc_server.TRPCRouterBuilder<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: true;
}>;

export { router, t };
