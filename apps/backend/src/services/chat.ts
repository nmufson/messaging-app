import { ChatType } from '@common/schemas/chat';
import { Chat } from '@db';
import { PrismaClient } from '@db';
import { ObjectId } from '@common/schemas/primitives';

export const findOrCreateDirectChat = async (
  prisma: PrismaClient,
  senderId: ObjectId,
  receiverId: ObjectId
): Promise<{ chat: Chat; isNewChat: boolean }> => {
  const existingChat = await prisma.chat.findFirst({
    where: {
      type: ChatType.enum.DIRECT,
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
