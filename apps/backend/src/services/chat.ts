import { Chat } from '@/packages/db';
import { PrismaClient } from '@prisma/client';

export const findOrCreateDirectChat = async (
  prisma: PrismaClient,
  senderId: string,
  receiverId: string
): Promise<Chat> => {
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
    return existingChat;
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

  return newChat;
};
