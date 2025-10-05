import * as luxon from 'luxon';
import * as _trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs from '@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs';
import * as express from 'express';
import * as _db from '@db';
import * as _trpc_server from '@trpc/server';
import { Context } from './context.mjs';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const appRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    auth: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: false;
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
            output: express.User;
            meta: object;
        }>;
    }>>;
    user: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: false;
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
    chat: _trpc_server.TRPCBuiltRouter<{
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
    friendRequest: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: false;
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
    message: _trpc_server.TRPCBuiltRouter<{
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
    image: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: false;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        getImageUploadSignature: _trpc_server.TRPCMutationProcedure<{
            input: void;
            output: {
                timestamp: number;
                signature: string;
                cloudName: string | undefined;
                apiKey: string | undefined;
            };
            meta: object;
        }>;
    }>>;
}>>;
type AppRouter = typeof appRouter;

export { type AppRouter, appRouter };
