export declare const imageRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: any;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getImageUploadSignature: import("@trpc/server").TRPCMutationProcedure<{
        input: void;
        output: {
            timestamp: number;
            signature: string;
            cloudName: string | undefined;
            apiKey: string | undefined;
        };
        meta: object;
    }>;
}>>;
