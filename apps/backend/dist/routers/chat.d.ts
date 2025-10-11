export declare const chatRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
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
