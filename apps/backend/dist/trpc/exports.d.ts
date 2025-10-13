import * as node_modules__trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs from 'node_modules/@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs';
import * as luxon from 'luxon';
import * as _prisma_client from '@prisma/client';
import * as _trpc_server from '@trpc/server';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { User, prisma } from '@repo/db';
import { Request, Response } from 'express';
import { IncomingMessage } from 'http';

interface BaseContext {
    user?: User;
    prisma: typeof prisma;
}
interface HTTPContext extends BaseContext {
    req: Request;
    res: Response;
}
interface WSContext extends BaseContext {
    req: IncomingMessage;
}
type Context = HTTPContext | WSContext;

declare const appRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: true;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    auth: _trpc_server.TRPCBuiltRouter<{
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
                    role: _prisma_client.$Enums.UserRole;
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
            output: {
                id: string;
                email: string;
                role: "USER" | "ADMIN";
                profile: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    profilePictureUrl: string | null;
                };
            };
            meta: object;
        }>;
    }>>;
    user: _trpc_server.TRPCBuiltRouter<{
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
                    role: _prisma_client.$Enums.UserRole;
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
                role: _prisma_client.$Enums.UserRole;
                createdAt: Date;
            };
            meta: object;
        }>;
    }>>;
    chat: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        byId: _trpc_server.TRPCQueryProcedure<{
            input: {
                chatId: string;
                limit?: number | undefined;
                cursor?: string | undefined;
            };
            output: {
                id: string;
                type: "GROUP" | "DIRECT";
                createdAt: luxon.DateTime<boolean>;
                updatedAt: luxon.DateTime<boolean> | null;
                participants: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    profilePictureUrl: string | null;
                }[];
                messages: {
                    id: string;
                    type: "TEXT" | "IMAGE";
                    content: string | null;
                    imageUrl: string | null;
                    createdAt: luxon.DateTime<boolean>;
                    updatedAt: luxon.DateTime<boolean> | null;
                    senderId: string;
                }[];
                name: string | null;
                groupPictureUrl: string | null;
                creatorId: string;
            };
            meta: object;
        }>;
        onNewMessageInChat: _trpc_server.TRPCSubscriptionProcedure<{
            input: {
                profileId: string;
            };
            output: AsyncIterable<node_modules__trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs.TrackedData<any>, void, any>;
            meta: object;
        }>;
        onNewChat: _trpc_server.TRPCSubscriptionProcedure<{
            input: {
                profileId: string;
            };
            output: AsyncIterable<node_modules__trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs.TrackedData<any>, void, any>;
            meta: object;
        }>;
        getList: _trpc_server.TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
            };
            output: {
                id: string;
                type: "GROUP" | "DIRECT";
                createdAt: luxon.DateTime<boolean>;
                updatedAt: luxon.DateTime<boolean> | null;
                participants: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    profilePictureUrl: string | null;
                }[];
                messages: {
                    id: string;
                    type: "TEXT" | "IMAGE";
                    content: string | null;
                    imageUrl: string | null;
                    createdAt: luxon.DateTime<boolean>;
                    updatedAt: luxon.DateTime<boolean> | null;
                    senderId: string;
                }[];
                name: string | null;
                groupPictureUrl: string | null;
                creatorId: string;
            }[];
            meta: object;
        }>;
        getAll: _trpc_server.TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
            };
            output: {
                id: string;
                type: "GROUP" | "DIRECT";
                createdAt: luxon.DateTime<boolean>;
                updatedAt: luxon.DateTime<boolean> | null;
                participants: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    profilePictureUrl: string | null;
                }[];
                messages: {
                    id: string;
                    type: "TEXT" | "IMAGE";
                    content: string | null;
                    imageUrl: string | null;
                    createdAt: luxon.DateTime<boolean>;
                    updatedAt: luxon.DateTime<boolean> | null;
                    senderId: string;
                }[];
                name: string | null;
                groupPictureUrl: string | null;
                creatorId: string;
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
                type: _prisma_client.$Enums.ChatType;
                createdAt: Date;
                updatedAt: Date | null;
                creatorId: string;
                groupPictureUrl: string | null;
            };
            meta: object;
        }>;
    }>>;
    friendRequest: _trpc_server.TRPCBuiltRouter<{
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
                status: _prisma_client.$Enums.FriendRequestStatus;
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
                status: _prisma_client.$Enums.FriendRequestStatus;
            };
            meta: object;
        }>;
    }>>;
    message: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        onNewMessage: _trpc_server.TRPCSubscriptionProcedure<{
            input: {
                chatId: string;
                lastMessageId?: string | null | undefined;
            };
            output: AsyncIterable<node_modules__trpc_server_dist_unstable_core_do_not_import_d_DKRHq4OJ_cjs.TrackedData<any>, void, any>;
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
                    type: _prisma_client.$Enums.ChatType;
                    createdAt: Date;
                    updatedAt: Date | null;
                    creatorId: string;
                    groupPictureUrl: string | null;
                };
                newDirectMessage: {
                    id: string;
                    type: _prisma_client.$Enums.MessageType;
                    createdAt: Date;
                    updatedAt: Date | null;
                    chatId: string;
                    senderId: string;
                    content: string | null;
                    imageUrl: string | null;
                };
            };
            meta: object;
        }>;
        sendToChat: _trpc_server.TRPCMutationProcedure<{
            input: {
                type: "TEXT" | "IMAGE";
                content: string | null;
                imageUrl: string | null;
                sender: string;
                chatId: string;
            };
            output: {
                id: string;
                type: "TEXT" | "IMAGE";
                content: string | null;
                imageUrl: string | null;
                createdAt: luxon.DateTime<boolean>;
                updatedAt: luxon.DateTime<boolean> | null;
                senderId: string;
            };
            meta: object;
        }>;
    }>>;
    profile: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        byId: _trpc_server.TRPCQueryProcedure<{
            input: {
                profileId: string;
            };
            output: {
                numOfFriends: number;
                id: string;
                createdAt: luxon.DateTime<boolean>;
                updatedAt: luxon.DateTime<boolean> | null;
                firstName: string;
                lastName: string;
                profilePictureUrl: string | null;
            };
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
                firstName: string;
                lastName: string;
                profilePictureUrl: string | null;
                userId: string;
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
                firstName: string;
                lastName: string;
                profilePictureUrl: string | null;
                userId: string;
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
    image: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: true;
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
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type { AppRouter, RouterInputs, RouterOutputs };
