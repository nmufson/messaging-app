export declare const userRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: any;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getUserById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId: string;
        };
        output: {
            user: Promise<{
                id: string;
                email: string;
                hashedPassword: string;
                role: import("@prisma/client").$Enums.UserRole;
                createdAt: Date;
            } | null>;
        };
        meta: object;
    }>;
    getUserByEmail: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            email: string;
        };
        output: {
            id: string;
            email: string;
            hashedPassword: string;
            role: import("@prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
        meta: object;
    }>;
}>>;
