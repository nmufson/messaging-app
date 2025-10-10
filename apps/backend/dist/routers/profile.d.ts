export declare const profileRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: any;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    byId: import("@trpc/server").TRPCQueryProcedure<{
        input: any;
        output: any;
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            firstName: string;
            lastName: string;
            profilePictureUrl?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            profileId: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
            profilePictureUrl?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    getFriends: import("@trpc/server").TRPCQueryProcedure<{
        input: any;
        output: any;
        meta: object;
    }>;
}>>;
