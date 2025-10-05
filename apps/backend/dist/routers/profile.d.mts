import * as _trpc_server from '@trpc/server';
import { Context } from '../trpc/context.mjs';
import 'express';
import '@db';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const profileRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    byId: _trpc_server.TRPCQueryProcedure<{
        input: {
            profileId: string;
        };
        output: {
            id: string;
            createdAt: Date;
            userId: string;
            firstName: string;
            lastName: string;
            profilePictureUrl: string | null;
            updatedAt: Date | null;
        } | null;
        meta: object;
    }>;
    create: _trpc_server.TRPCMutationProcedure<{
        input: {
            userId: string;
            firstName: string;
            lastName: string;
            profilePictureUrl?: string | undefined;
        };
        output: {
            id: string;
            createdAt: Date;
            userId: string;
            firstName: string;
            lastName: string;
            profilePictureUrl: string | null;
            updatedAt: Date | null;
        };
        meta: object;
    }>;
    update: _trpc_server.TRPCMutationProcedure<{
        input: {
            profileId: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
            profilePictureUrl?: string | undefined;
        };
        output: {
            id: string;
            createdAt: Date;
            userId: string;
            firstName: string;
            lastName: string;
            profilePictureUrl: string | null;
            updatedAt: Date | null;
        };
        meta: object;
    }>;
    getFriends: _trpc_server.TRPCQueryProcedure<{
        input: {
            profileId: string;
        };
        output: {
            friends: {
                id: string;
                firstName: string;
                lastName: string;
                profilePictureUrl: string | null;
            }[];
        } | null;
        meta: object;
    }>;
}>>;

export { profileRouter };
