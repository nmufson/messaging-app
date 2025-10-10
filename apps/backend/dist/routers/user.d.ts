export declare const userRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
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
