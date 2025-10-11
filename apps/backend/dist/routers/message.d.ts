export declare const messageRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: any;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    onNewMessage: import("@trpc/server").TRPCSubscriptionProcedure<{
        input: {
            chatId: string;
            lastMessageId?: string | null | undefined;
        };
        output: AsyncIterable<import("node_modules/@trpc/server/dist/unstable-core-do-not-import.d-DKRHq4OJ.cjs").TrackedData<any>, void, any>;
        meta: object;
    }>;
    sendDirect: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            [x: string]: any;
            sender: string;
            receiver: string;
            content: string | null;
            imageUrl: string | null;
        };
        output: {
            chat: {
                name: string | null;
                id: string;
                createdAt: Date;
                creatorId: string;
                type: import("@prisma/client").$Enums.ChatType;
                groupPictureUrl: string | null;
                updatedAt: Date | null;
            };
            newDirectMessage: {
                id: string;
                createdAt: Date;
                chatId: string;
                type: import("@prisma/client").$Enums.MessageType;
                updatedAt: Date | null;
                content: string | null;
                imageUrl: string | null;
                senderId: string;
            };
        };
        meta: object;
    }>;
    sendTochat: import("@trpc/server").TRPCQueryProcedure<{
        input: any;
        output: {
            newMessage: {
                id: string;
                createdAt: Date;
                chatId: string;
                type: import("@prisma/client").$Enums.MessageType;
                updatedAt: Date | null;
                content: string | null;
                imageUrl: string | null;
                senderId: string;
            };
        };
        meta: object;
    }>;
}>>;
