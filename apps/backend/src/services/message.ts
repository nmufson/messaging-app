import { SendMessageInput } from '@common/src/schemas/message';
import { PrismaClient } from '@repo/db';

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
      chat: { connect: { id: chatId } },
    },
  });
};
