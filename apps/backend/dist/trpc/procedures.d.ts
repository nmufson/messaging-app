import * as _db from '@db';
import * as _trpc_server from '@trpc/server';
import { Context } from './context.js';
import 'express';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const publicProcedure: _trpc_server.TRPCProcedureBuilder<Context, object, object, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, false>;
declare const userProcedure: _trpc_server.TRPCProcedureBuilder<Context, object, {
    ctx: {
        user: _db.User;
    };
}, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, false>;
declare const adminProcedure: _trpc_server.TRPCProcedureBuilder<Context, object, {
    ctx: {
        user: _db.User;
    };
}, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, _trpc_server.TRPCUnsetMarker, false>;

export { adminProcedure, publicProcedure, userProcedure };
