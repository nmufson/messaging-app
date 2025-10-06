import * as _db from '@db';
import * as _trpc_server from '@trpc/server';
import { Context } from '../trpc/context.mjs';
import 'express';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const friendRequestRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: true;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    sendNew: _trpc_server.TRPCMutationProcedure<{
        input: {
            senderId: string;
            receiverId: string;
        };
        output: {
            id: string;
            createdAt: Date;
            updatedAt: Date | null;
            senderId: string;
            receiverId: string;
            status: _db.$Enums.FriendRequestStatus;
        };
        meta: object;
    }>;
    update: _trpc_server.TRPCMutationProcedure<{
        input: {
            newStatus: "PENDING" | "CANCELLED" | "DECLINED" | "ACCEPTED";
            senderId: string;
            receiverId: string;
        };
        output: {
            id: string;
            createdAt: Date;
            updatedAt: Date | null;
            senderId: string;
            receiverId: string;
            status: _db.$Enums.FriendRequestStatus;
        };
        meta: object;
    }>;
}>>;

export { friendRequestRouter };
