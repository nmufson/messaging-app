"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const sendMessage = async (prisma, params) => {
    const { chatId, sender, type, content, imageUrl } = params;
    return await prisma.message.create({
        data: {
            type,
            content,
            imageUrl,
            sender: { connect: { id: sender } },
            chat: { connect: { id: chatId } },
        },
    });
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=message.js.map