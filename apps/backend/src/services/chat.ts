import { ChatType } from '@repo/common';
import { Chat } from '@repo/db';
import { PrismaClient } from '@repo/db';
import { ObjectId } from '@repo/common';

// TODO make endpoint for finding direct chat and use this there
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
      creatorId: senderId,
      participants: {
        connect: [{ id: senderId }, { id: receiverId }],
      },
    },
  });

  return { chat: newChat, isNewChat: true };
};
