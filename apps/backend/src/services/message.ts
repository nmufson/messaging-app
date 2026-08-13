import { eventEmitter } from '@/lib/eventBus';
import { logger } from '@/lib/pino';
import {
  PhotoMessageSearchResultDTO,
  TextMessageSearchResultDTO,
  ObjectId,
  SendMessageInput,
  tagActivity,
  IMessageActivity,
} from '@repo/common';
import { PrismaClient } from '@repo/db';

/**
 * Creates a new message
 * Tags message as activity and emits event for new activity in chat
 */
export async function sendMessage(
  prisma: PrismaClient,
  params: SendMessageInput
): Promise<IMessageActivity> {
  const { chatId, senderId, type, content, imageUrl } = params;

  const newMessage = await prisma.message.create({
    data: {
      type,
      content,
      imageUrl,
      sender: { connect: { id: senderId } },
      chat: { connect: { id: chatId } },
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
    },
  });

  await incrementUnreadActivityCount(prisma, chatId, senderId);

  const newMessageActivity = tagActivity(newMessage, 'message');

  logger.info({ newMessageActivity }, 'Emitting message activity');
  eventEmitter.emit(`activity:create:${chatId}`, newMessageActivity);

  return newMessageActivity;
}

export async function incrementUnreadActivityCount(
  prisma: PrismaClient,
  chatId: string,
  excludingProfileId: string
): Promise<void> {
  await prisma.chatParticipant.updateMany({
    where: {
      chatId,
      profileId: { not: excludingProfileId },
    },
    data: {
      unreadActivities: {
        increment: 1,
      },
    },
  });
}

interface GetMessagesParams {
  profileId: string;
  searchInput?: string;
  limit?: number;
}

export async function getMatchingTextMessages(
  prisma: PrismaClient,
  params: GetMessagesParams
): Promise<TextMessageSearchResultDTO[]> {
  const { profileId, searchInput, limit } = params;
  const normalizedSearchInput = searchInput?.trim();

  logger.info(
    { profileId, searchInput: normalizedSearchInput, limit },
    'Fetching matching text messages'
  );

  const messages = await prisma.message.findMany({
    where: {
      type: 'TEXT',
      content: {
        not: null,
      },
      chat: {
        participants: {
          some: {
            profileId,
          },
        },
      },
      ...(normalizedSearchInput && {
        OR: [
          {
            content: {
              contains: normalizedSearchInput,
              mode: 'insensitive' as const,
            },
          },
          {
            sender: {
              OR: [
                {
                  firstName: {
                    contains: normalizedSearchInput,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  lastName: {
                    contains: normalizedSearchInput,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
          },
          {
            chat: {
              name: {
                contains: normalizedSearchInput,
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
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
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
  logger.info({ messages }, 'Fetched matching text messages');

  const parsedMessages = TextMessageSearchResultDTO.array().parse(messages);
  logger.info({ parsedMessages }, 'Parsed matching text messages');
  return parsedMessages;
}
// TODO: implement pagination for these

interface GetPhotoMessagesParams {
  profileId: ObjectId;
  searchInput?: string;
  limit?: number;
}

export async function getMatchingPhotoMessages(
  prisma: PrismaClient,
  params: GetPhotoMessagesParams
): Promise<PhotoMessageSearchResultDTO[]> {
  const { profileId, searchInput, limit } = params;
  const normalizedSearchInput = searchInput?.trim();

  const photoMessages = await prisma.message.findMany({
    where: {
      type: 'IMAGE',
      imageUrl: { not: null },
      chat: {
        participants: {
          some: {
            profileId,
          },
        },
      },
      ...(normalizedSearchInput && {
        OR: [
          {
            imageUrl: {
              contains: normalizedSearchInput,
              mode: 'insensitive' as const,
            },
          },
          {
            sender: {
              OR: [
                {
                  firstName: {
                    contains: normalizedSearchInput,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  lastName: {
                    contains: normalizedSearchInput,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
          },
          {
            chat: {
              name: {
                contains: normalizedSearchInput,
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
}
