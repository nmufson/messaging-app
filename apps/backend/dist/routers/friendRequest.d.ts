export declare const friendRequestRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
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
