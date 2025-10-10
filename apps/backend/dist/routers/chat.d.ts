export declare const chatRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
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
