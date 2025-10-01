"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const primitives_1 = require("@common/schemas/primitives");
const message_1 = require("@common/schemas/message");
const server_1 = require("@trpc/server");
const common_1 = require("@quickChat/common");
const chat_1 = require("../services/chat");
const message_2 = require("../services/message");
const trpc_1 = require("../trpc");
const events_1 = require("events");
const eventBus_1 = require("../lib/eventBus");
exports.messageRouter = (0, trpc_1.router)({
    onNewMessage: trpc_1.userProcedure
        .input(common_1.z.object({
        chatId: primitives_1.ObjectId,
        lastMessageId: primitives_1.ObjectId.nullish(),
    }))
        .subscription(async function* ({ input, ctx, signal }) {
        const { lastMessageId, chatId } = input;
        if (lastMessageId) {
            const lastMessage = await ctx.prisma.message.findUnique({
                where: { id: lastMessageId },
            });
            if (lastMessage) {
                const missedMessages = await ctx.prisma.message.findMany({
                    where: {
                        chatId,
                        // query all messages created after our lastMessage
                        createdAt: { gt: lastMessage.createdAt },
                    },
                    orderBy: { createdAt: 'asc' },
                });
                for (const msg of missedMessages) {
                    yield (0, server_1.tracked)(msg.id, msg);
                }
            }
        }
        for await (const [message] of (0, events_1.on)(eventBus_1.eventEmitter, `addMessageToChat:${chatId}`, {
            signal,
        })) {
            yield (0, server_1.tracked)(message.id, message);
        }
    }),
    sendDirect: trpc_1.userProcedure
        .input(common_1.z.object({
        sender: primitives_1.ObjectId,
        receiver: primitives_1.ObjectId,
        type: message_1.MessageType,
        content: common_1.z.string().nullable(),
        imageUrl: common_1.z.string().nullable(),
    }))
        // TODO: add an event emitter here for add chat
        .mutation(async ({ input, ctx }) => {
        const { sender, receiver, content, imageUrl, type } = input;
        const { chat, isNewChat } = await (0, chat_1.findOrCreateDirectChat)(ctx.prisma, sender, receiver);
        if (!chat) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'chat not found or could not be created',
            });
        }
        const newDirectMessage = await (0, message_2.sendMessage)(ctx.prisma, {
            ...input,
            chatId: chat.id,
        });
        if (isNewChat) {
            eventBus_1.eventEmitter.emit(`newChat:${sender}`, chat);
            eventBus_1.eventEmitter.emit(`newChat:${receiver}`, chat);
        }
        return { chat, newDirectMessage };
    }),
    sendTochat: trpc_1.userProcedure
        .input(message_1.SendMessageInput)
        .query(async ({ input, ctx }) => {
        const { sender, chatId, content, imageUrl, type } = input;
        const chat = await ctx.prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                participants: true,
            },
        });
        if (!chat) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'chat not found',
            });
        }
        if (!chat.participants.some((p) => p.id === sender)) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'User is not a participant in this chat',
            });
        }
        const newMessage = await (0, message_2.sendMessage)(ctx.prisma, input);
        eventBus_1.eventEmitter.emit(`addMessageToChat:${chatId}`, newMessage);
        return { newMessage };
    }),
});
