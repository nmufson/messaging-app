export declare const messageRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: any;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    onNewMessage: import("@trpc/server").TRPCSubscriptionProcedure<{
        input: any;
        output: AsyncIterable<import("@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
        meta: object;
    }>;
    sendDirect: import("@trpc/server").TRPCMutationProcedure<{
        input: any;
        output: {
            chat: any;
            newDirectMessage: any;
        };
        meta: object;
    }>;
    sendTochat: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            type: "TEXT" | "IMAGE";
            content: string | null;
            imageUrl: string | null;
            sender: string;
            chatId: string;
        };
        output: {
            newMessage: any;
        };
        meta: object;
    }>;
}>>;
