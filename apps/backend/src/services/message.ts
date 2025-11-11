import {
  ListPhotoMessageDTO,
  MessageSearchResultDTO,
  ObjectId,
  SendMessageInput,
} from '@repo/common';
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

interface GetMessagesParams {
  profileId: string;
  searchInput?: string;
  limit?: number;
}
// TODO: implement pagination for these
export const getMatchingTextMessages = async (
  prisma: PrismaClient,
  params: GetMessagesParams
): Promise<MessageSearchResultDTO[]> => {
  const { profileId, searchInput, limit } = params;

  const messages = await prisma.message.findMany({
    where: {
      senderId: { not: profileId },
      type: 'TEXT',
      content: {
        not: null,
        contains: searchInput,
        mode: 'insensitive',
      },
      chat: {
        participants: {
          some: {
            id: profileId,
          },
        },
      },
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      chat: {
        select: {
          name: true,
          participants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  const parsedMessages = MessageSearchResultDTO.array().parse(messages);

  return parsedMessages;
};
// TODO: implement pagination for these

interface GetPhotoMessagesParams {
  profileId: ObjectId;
  limit?: number;
}

export const getPhotoMessages = async (
  prisma: PrismaClient,
  params: GetPhotoMessagesParams
): Promise<ListPhotoMessageDTO[]> => {
  const { profileId, limit } = params;

  const photoMessages = await prisma.message.findMany({
    where: {
      senderId: { not: profileId },
      type: 'IMAGE',
      imageUrl: { not: null },
      chat: {
        participants: {
          some: {
            id: profileId,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const parsedPhotoMessages = ListPhotoMessageDTO.array().parse(photoMessages);

  return parsedPhotoMessages;
};
