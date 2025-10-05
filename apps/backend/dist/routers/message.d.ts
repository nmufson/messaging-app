import * as _db from '@db';
import * as _trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs from '@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs';
import * as _trpc_server from '@trpc/server';
import { Context } from '../trpc/context.js';
import 'express';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const messageRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    onNewMessage: _trpc_server.TRPCSubscriptionProcedure<{
        input: {
            chatId: string;
            lastMessageId?: string | null | undefined;
        };
        output: AsyncIterable<_trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs.TrackedData<any>, void, any>;
        meta: object;
    }>;
    sendDirect: _trpc_server.TRPCMutationProcedure<{
        input: {
            sender: string;
            receiver: string;
            type: "TEXT" | "IMAGE";
            content: string | null;
            imageUrl: string | null;
        };
        output: {
            chat: {
                name: string | null;
                id: string;
                createdAt: Date;
                type: _db.$Enums.ChatType;
                updatedAt: Date | null;
                groupPictureUrl: string | null;
                creatorId: string;
            };
            newDirectMessage: {
                id: string;
                createdAt: Date;
                type: _db.$Enums.MessageType;
                updatedAt: Date | null;
                content: string | null;
                chatId: string;
                imageUrl: string | null;
                senderId: string;
            };
        };
        meta: object;
    }>;
    sendTochat: _trpc_server.TRPCQueryProcedure<{
        input: {
            type: "TEXT" | "IMAGE";
            content: string | null;
            imageUrl: string | null;
            sender: string;
            chatId: string;
        };
        output: {
            newMessage: {
                id: string;
                createdAt: Date;
                type: _db.$Enums.MessageType;
                updatedAt: Date | null;
                content: string | null;
                chatId: string;
                imageUrl: string | null;
                senderId: string;
            };
        };
        meta: object;
    }>;
}>>;

export { messageRouter };
