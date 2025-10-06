import * as _db from '@db';
import * as _trpc_server from '@trpc/server';
import { Context } from '../trpc/context.js';
import { User } from 'express';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const authRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: true;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    register: _trpc_server.TRPCMutationProcedure<{
        input: {
            email: string;
            password: string;
            confirmPassword: string;
        };
        output: {
            user: {
                id: string;
                email: string;
                hashedPassword: string;
                role: _db.$Enums.UserRole;
                createdAt: Date;
            };
        };
        meta: object;
    }>;
    login: _trpc_server.TRPCMutationProcedure<{
        input: {
            email: string;
            password: string;
        };
        output: unknown;
        meta: object;
    }>;
    logout: _trpc_server.TRPCMutationProcedure<{
        input: void;
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    me: _trpc_server.TRPCQueryProcedure<{
        input: void;
        output: User;
        meta: object;
    }>;
}>>;

export { authRouter };
