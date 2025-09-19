import { MessageType, SendMessageInput } from '@common/schemas/message';
import { PrismaClient } from '@prisma/client';
import { Send } from 'express';

export const sendMessage = async (
  prisma: PrismaClient,
  params: SendMessageInput
) => {
  const { chatId, sender, type, content, imageUrl } = params;

  return await prisma.message.create({
    data: {
      type,
      content,
      imageUrl,
      sender: { connect: { id: sender } },
      conversation: { connect: { id: chatId } },
    },
  });
};
