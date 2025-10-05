import * as _trpc_server from '@trpc/server';
import { Context } from './context.js';
import { User } from '@db';
import 'express';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const isAuthed: _trpc_server.TRPCMiddlewareBuilder<Context, object, {
    ctx: {
        user: User;
    };
}, unknown>;
declare const isAdmin: _trpc_server.TRPCMiddlewareBuilder<Context, object, {
    ctx: {
        user: User;
    };
}, unknown>;

export { isAdmin, isAuthed };
