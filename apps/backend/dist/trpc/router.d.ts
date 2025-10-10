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
            input: {
                email: string;
                password: string;
                confirmPassword: string;
            };
            output: {
                user: any;
            };
            meta: object;
        }>;
        login: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                email: string;
                password: string;
            };
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
            input: any;
            output: {
                user: Promise<any>;
            };
            meta: object;
        }>;
        getUserByEmail: import("@trpc/server").TRPCQueryProcedure<{
            input: any;
            output: any;
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
            input: any;
            output: {
                id: string;
                type: "GROUP" | "DIRECT";
                createdAt: import("luxon").DateTime<boolean>;
                updatedAt: import("luxon").DateTime<boolean> | null;
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
                    createdAt: import("luxon").DateTime<boolean>;
                    updatedAt: import("luxon").DateTime<boolean> | null;
                    senderId: string;
                }[];
                name: string | null;
                groupPictureUrl: string | null;
                creatorId: string;
            };
            meta: object;
        }>;
        onNewMessageInChat: import("@trpc/server").TRPCSubscriptionProcedure<{
            input: any;
            output: AsyncIterable<import("@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
            meta: object;
        }>;
        onNewChat: import("@trpc/server").TRPCSubscriptionProcedure<{
            input: any;
            output: AsyncIterable<import("@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
            meta: object;
        }>;
        getList: import("@trpc/server").TRPCQueryProcedure<{
            input: any;
            output: any;
            meta: object;
        }>;
        getAll: import("@trpc/server").TRPCQueryProcedure<{
            input: any;
            output: {
                message: string;
            };
            meta: object;
        }>;
        createGroup: import("@trpc/server").TRPCMutationProcedure<{
            input: any;
            output: any;
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
            input: any;
            output: any;
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: any;
            output: any;
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
            input: any;
            output: AsyncIterable<import("@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
            meta: object;
        }>;
        sendDirect: import("@trpc/server").TRPCMutationProcedure<{
            input: any;
            output: {
                chat: any;
                newDirectMessage: any;
            };
            meta: object;
        }>;
        sendTochat: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                type: "TEXT" | "IMAGE";
                content: string | null;
                imageUrl: string | null;
                sender: string;
                chatId: string;
            };
            output: {
                newMessage: any;
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
