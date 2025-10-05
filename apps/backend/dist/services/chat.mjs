// src/services/chat.ts
import { ChatType } from "@common/schemas/chat";
var findOrCreateDirectChat = async (prisma, senderId, receiverId) => {
  const existingChat = await prisma.chat.findFirst({
    where: {
      type: ChatType.enum.DIRECT,
      participants: {
        every: {
          id: { in: [senderId, receiverId] }
        },
        some: {
          id: senderId
        }
      }
    },
    include: { participants: true }
  });
  if (existingChat && existingChat.participants.length === 2) {
    return { chat: existingChat, isNewChat: false };
  }
  const newChat = await prisma.chat.create({
    data: {
      type: "DIRECT",
      creatorId: senderId,
      participants: {
        connect: [{ id: senderId }, { id: receiverId }]
      }
    }
  });
  return { chat: newChat, isNewChat: true };
};
export {
  findOrCreateDirectChat
};
//# sourceMappingURL=chat.mjs.map