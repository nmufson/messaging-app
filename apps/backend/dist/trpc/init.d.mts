import * as _trpc_server from '@trpc/server';
import { Context } from './context.mjs';
import 'express';
import '@db';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const t: _trpc_server.TRPCRootObject<Context, object, _trpc_server.TRPCRuntimeConfigOptions<Context, object>, {
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
}>;
declare const router: _trpc_server.TRPCRouterBuilder<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
}>;

export { router, t };
