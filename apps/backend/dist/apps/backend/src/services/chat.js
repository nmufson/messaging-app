"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateDirectChat = void 0;
const chat_1 = require("@common/schemas/chat");
const findOrCreateDirectChat = async (prisma, senderId, receiverId) => {
    const existingChat = await prisma.chat.findFirst({
        where: {
            type: chat_1.ChatType.enum.DIRECT,
            participants: {
                every: {
                    id: { in: [senderId, receiverId] },
                },
                some: {
                    id: senderId,
                },
            },
        },
        include: { participants: true },
    });
    if (existingChat && existingChat.participants.length === 2) {
        return { chat: existingChat, isNewChat: false };
    }
    const newChat = await prisma.chat.create({
        data: {
            type: 'DIRECT',
            creator: senderId,
            participants: {
                connect: [{ id: senderId }, { id: receiverId }],
            },
        },
    });
    return { chat: newChat, isNewChat: true };
};
exports.findOrCreateDirectChat = findOrCreateDirectChat;
