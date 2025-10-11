import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("./context").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: any;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    auth: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context").Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: any;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        register: import("@trpc/server").TRPCMutationProcedure<{
            input: any;
            output: {
                user: {
                    id: string;
                    email: string;
                    hashedPassword: string;
                    role: import("@prisma/client").$Enums.UserRole;
                    createdAt: Date;
                };
            };
            meta: object;
        }>;
        login: import("@trpc/server").TRPCMutationProcedure<{
            input: any;
            output: unknown;
            meta: object;
        }>;
        logout: import("@trpc/server").TRPCMutationProcedure<{
            input: void;
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        me: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: any;
            meta: object;
        }>;
    }>>;
    user: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context").Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: any;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getUserById: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                userId: string;
            };
            output: {
                user: Promise<{
                    id: string;
                    email: string;
                    hashedPassword: string;
                    role: import("@prisma/client").$Enums.UserRole;
                    createdAt: Date;
                } | null>;
            };
            meta: object;
        }>;
        getUserByEmail: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                email: string;
            };
            output: {
                id: string;
                email: string;
                hashedPassword: string;
                role: import("@prisma/client").$Enums.UserRole;
                createdAt: Date;
            };
            meta: object;
        }>;
    }>>;
    chat: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context").Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: any;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        byId: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                chatId: string;
                limit?: number | undefined;
                cursor?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        onNewMessageInChat: import("@trpc/server").TRPCSubscriptionProcedure<{
            input: {
                profileId: string;
            };
            output: AsyncIterable<import("node_modules/@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
            meta: object;
        }>;
        onNewChat: import("@trpc/server").TRPCSubscriptionProcedure<{
            input: {
                profileId: string;
            };
            output: AsyncIterable<import("node_modules/@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
            meta: object;
        }>;
        getList: import("@trpc/server").TRPCQueryProcedure<{
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
                    chatId: string;
                    type: import("@prisma/client").$Enums.MessageType;
                    updatedAt: Date | null;
                    content: string | null;
                    imageUrl: string | null;
                    senderId: string;
                })[];
            } & {
                name: string | null;
                id: string;
                createdAt: Date;
                creatorId: string;
                type: import("@prisma/client").$Enums.ChatType;
                groupPictureUrl: string | null;
                updatedAt: Date | null;
            })[];
            meta: object;
        }>;
        getAll: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
            };
            output: {
                message: string;
            };
            meta: object;
        }>;
        createGroup: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                creator: string;
                participants: string[];
            };
            output: {
                name: string | null;
                id: string;
                createdAt: Date;
                creatorId: string;
                type: import("@prisma/client").$Enums.ChatType;
                groupPictureUrl: string | null;
                updatedAt: Date | null;
            };
            meta: object;
        }>;
    }>>;
    friendRequest: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context").Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: any;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        sendNew: import("@trpc/server").TRPCMutationProcedure<{
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
                status: import("@prisma/client").$Enums.FriendRequestStatus;
            };
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                [x: string]: any;
                senderId: string;
                receiverId: string;
            };
            output: {
                id: string;
                createdAt: Date;
                updatedAt: Date | null;
                senderId: string;
                receiverId: string;
                status: import("@prisma/client").$Enums.FriendRequestStatus;
            };
            meta: object;
        }>;
    }>>;
    message: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context").Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: any;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        onNewMessage: import("@trpc/server").TRPCSubscriptionProcedure<{
            input: {
                chatId: string;
                lastMessageId?: string | null | undefined;
            };
            output: AsyncIterable<import("node_modules/@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
            meta: object;
        }>;
        sendDirect: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                [x: string]: any;
                sender: string;
                receiver: string;
                content: string | null;
                imageUrl: string | null;
            };
            output: {
                chat: {
                    name: string | null;
                    id: string;
                    createdAt: Date;
                    creatorId: string;
                    type: import("@prisma/client").$Enums.ChatType;
                    groupPictureUrl: string | null;
                    updatedAt: Date | null;
                };
                newDirectMessage: {
                    id: string;
                    createdAt: Date;
                    chatId: string;
                    type: import("@prisma/client").$Enums.MessageType;
                    updatedAt: Date | null;
                    content: string | null;
                    imageUrl: string | null;
                    senderId: string;
                };
            };
            meta: object;
        }>;
        sendTochat: import("@trpc/server").TRPCQueryProcedure<{
            input: any;
            output: {
                newMessage: {
                    id: string;
                    createdAt: Date;
                    chatId: string;
                    type: import("@prisma/client").$Enums.MessageType;
                    updatedAt: Date | null;
                    content: string | null;
                    imageUrl: string | null;
                    senderId: string;
                };
            };
            meta: object;
        }>;
    }>>;
    image: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context").Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: any;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getImageUploadSignature: import("@trpc/server").TRPCMutationProcedure<{
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
export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
