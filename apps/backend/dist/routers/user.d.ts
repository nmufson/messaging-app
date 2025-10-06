import * as _db from '@db';
import * as _trpc_server from '@trpc/server';
import { Context } from '../trpc/context.js';
import 'express';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const userRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: true;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    getUserById: _trpc_server.TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            user: Promise<{
                id: string;
                email: string;
                hashedPassword: string;
                role: _db.$Enums.UserRole;
                createdAt: Date;
            } | null>;
        };
        meta: object;
    }>;
    getUserByEmail: _trpc_server.TRPCQueryProcedure<{
        input: {
            email: string;
        };
        output: {
            id: string;
            email: string;
            hashedPassword: string;
            role: _db.$Enums.UserRole;
            createdAt: Date;
        };
        meta: object;
    }>;
}>>;

export { userRouter };
