import { Chat } from '@/packages/db';
import { PrismaClient } from '@quickChat/db';

export const findOrCreateDirectChat = async (
  prisma: PrismaClient,
  senderId: string,
  receiverId: string
): Promise<{ chat: Chat; isNewChat: boolean }> => {
  const existingChat = await prisma.chat.findUnique({
    where: {
      type: 'DIRECT',
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
