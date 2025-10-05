import * as luxon from 'luxon';
import * as _trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs from '@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs';
import * as _db from '@db';
import * as _trpc_server from '@trpc/server';
import { Context } from '../trpc/context.mjs';
import 'express';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const chatRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    byId: _trpc_server.TRPCQueryProcedure<{
        input: {
            chatId: string;
            limit?: number | undefined;
            cursor?: string | undefined;
        };
        output: {
            participants: {
                id: string;
                firstName: string;
                lastName: string;
                profilePictureUrl: string | null;
            }[];
            messages: {
                type: _db.$Enums.MessageType;
                content: string | null;
                imageUrl: string | null;
                senderId: string;
            }[];
        } & {
            name: string | null;
            id: string;
            createdAt: Date;
            type: _db.$Enums.ChatType;
            updatedAt: Date | null;
            groupPictureUrl: string | null;
            creatorId: string;
        };
        meta: object;
    }>;
    onNewMessageInChat: _trpc_server.TRPCSubscriptionProcedure<{
        input: {
            profileId: string;
        };
        output: AsyncIterable<_trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs.TrackedData<any>, void, any>;
        meta: object;
    }>;
    onNewChat: _trpc_server.TRPCSubscriptionProcedure<{
        input: {
            profileId: string;
        };
        output: AsyncIterable<_trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs.TrackedData<any>, void, any>;
        meta: object;
    }>;
    getList: _trpc_server.TRPCQueryProcedure<{
        input: {
            profileId: string;
            limit?: number | undefined;
        };
        output: ({
            participants: {
                id: string;
                firstName: string;
                lastName: string;
                profilePictureUrl: string | null;
            }[];
            messages: ({
                content: string | null;
                sender: {
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                type: _db.$Enums.MessageType;
                updatedAt: Date | null;
                content: string | null;
                chatId: string;
                imageUrl: string | null;
                senderId: string;
            })[];
        } & {
            name: string | null;
            id: string;
            createdAt: Date;
            type: _db.$Enums.ChatType;
            updatedAt: Date | null;
            groupPictureUrl: string | null;
            creatorId: string;
        })[];
        meta: object;
    }>;
    getAll: _trpc_server.TRPCQueryProcedure<{
        input: {
            limit?: number | undefined;
        };
        output: {
            id: string;
            type: "GROUP" | "DIRECT";
            createdAt: luxon.DateTime<true>;
            participants: {
                id: string;
                firstName: string;
                lastName: string;
                profilePictureUrl: string | null;
            }[];
            name: string | null;
            groupPictureUrl: string | null;
            updatedAt?: luxon.DateTime<true> | undefined;
            lastMessage?: {
                content: string;
                sender: {
                    firstName: string;
                    lastName: string;
                };
            } | undefined;
            creator?: {
                id: string;
                firstName: string;
                lastName: string;
            } | undefined;
        }[];
        meta: object;
    }>;
    createGroup: _trpc_server.TRPCMutationProcedure<{
        input: {
            creator: string;
            participants: string[];
        };
        output: {
            name: string | null;
            id: string;
            createdAt: Date;
            type: _db.$Enums.ChatType;
            updatedAt: Date | null;
            groupPictureUrl: string | null;
            creatorId: string;
        };
        meta: object;
    }>;
}>>;

export { chatRouter };
