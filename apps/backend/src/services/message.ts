import { logger } from '@/lib/pino';
import {
  PhotoMessageSearchResultDTO,
  TextMessageSearchResultDTO,
  MessageWithSenderDTO,
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
): Promise<TextMessageSearchResultDTO[]> => {
  const { profileId, searchInput, limit } = params;
  logger.info({ searchInput }, 'search input');
  const messages = await prisma.message.findMany({
    where: {
      type: 'TEXT',
      senderId: { not: profileId },
      content: {
        not: null,
      },
      chat: {
        participants: {
          some: {
            id: profileId,
          },
        },
      },
      ...(searchInput && {
        OR: [
          {
            content: {
              contains: searchInput,
              mode: 'insensitive' as const,
            },
          },
          {
            sender: {
              OR: [
                {
                  firstName: {
                    contains: searchInput,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  lastName: {
                    contains: searchInput,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
          },
          {
            chat: {
              name: {
                contains: searchInput,
                mode: 'insensitive' as const,
              },
            },
          },
        ],
      }),
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
          id: true,
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

  const parsedMessages = TextMessageSearchResultDTO.array().parse(messages);

  return parsedMessages;
};
// TODO: implement pagination for these

interface GetPhotoMessagesParams {
  profileId: ObjectId;
  searchInput?: string;
  limit?: number;
}

export const getMatchingPhotoMessages = async (
  prisma: PrismaClient,
  params: GetPhotoMessagesParams
): Promise<PhotoMessageSearchResultDTO[]> => {
  const { profileId, searchInput, limit } = params;

  const photoMessages = await prisma.message.findMany({
    where: {
      type: 'IMAGE',
      senderId: { not: profileId },
      imageUrl: { not: null },
      chat: {
        participants: {
          some: {
            id: profileId,
          },
        },
      },
      ...(searchInput && {
        OR: [
          {
            imageUrl: {
              contains: searchInput,
              mode: 'insensitive' as const,
            },
          },
          {
            sender: {
              OR: [
                {
                  firstName: {
                    contains: searchInput,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  lastName: {
                    contains: searchInput,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
          },
          {
            chat: {
              name: {
                contains: searchInput,
                mode: 'insensitive' as const,
              },
            },
          },
        ],
      }),
    },
    select: {
      id: true,
      type: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      chatId: true,
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    take: limit || 30,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const parsedPhotoMessages =
    PhotoMessageSearchResultDTO.array().parse(photoMessages);

  return parsedPhotoMessages;
};
