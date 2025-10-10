export declare const friendRequestRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
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
