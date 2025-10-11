export declare const profileRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: any;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    byId: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            profileId: string;
        };
        output: {
            id: string;
            createdAt: Date;
            updatedAt: Date | null;
            firstName: string;
            lastName: string;
            profilePictureUrl: string | null;
            userId: string;
        } | null;
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: any;
        output: {
            id: string;
            createdAt: Date;
            updatedAt: Date | null;
            firstName: string;
            lastName: string;
            profilePictureUrl: string | null;
            userId: string;
        };
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: any;
        output: {
            id: string;
            createdAt: Date;
            updatedAt: Date | null;
            firstName: string;
            lastName: string;
            profilePictureUrl: string | null;
            userId: string;
        };
        meta: object;
    }>;
    getFriends: import("@trpc/server").TRPCQueryProcedure<{
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
