export declare const authRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
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
