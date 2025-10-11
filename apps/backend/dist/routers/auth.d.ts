export declare const authRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
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
                role: import("@repo/db").$Enums.UserRole;
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
