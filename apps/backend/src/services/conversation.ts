import { Conversation } from '@/packages/db';
import { PrismaClient } from '@prisma/client';

export const findOrCreateDirectConvo = async (
  prisma: PrismaClient,
  senderId: string,
  receiverId: string
): Promise<Conversation> => {
  const existingConvo = await prisma.conversation.findUnique({
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

  if (existingConvo && existingConvo.participants.length === 2) {
    return existingConvo;
  }

  const newConvo = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      creator: senderId,
      participants: {
        connect: [{ id: senderId }, { id: receiverId }],
      },
    },
  });

  return newConvo;
};
