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

function buildNameSearchFilters(searchInput: string) {
  const normalizedInput = searchInput.trim().replace(/\s+/g, ' ');
  if (!normalizedInput) {
    return [];
  }

  const getContainsFilter = (value: string) => ({
    contains: value,
    mode: 'insensitive' as const,
  });

  const tokens = normalizedInput.split(' ').filter(Boolean);

  // single-field matches and tokenized matching for full names
  return [
    { firstName: getContainsFilter(normalizedInput) },
    { lastName: getContainsFilter(normalizedInput) },
    ...(tokens.length > 1
      ? [
          {
            AND: tokens.map((token) => ({
              OR: [
                { firstName: getContainsFilter(token) },
                { lastName: getContainsFilter(token) },
              ],
            })),
          },
        ]
      : []),
  ];
}

/**
 * Creates a new message
 * Tags message as activity and emits event for new activity in chat
 */
export async function sendMessage(
  prisma: PrismaClient,
  params: { message: SendMessageInput; chatId: ObjectId }
): Promise<IMessageActivity> {
  const { chatId, message } = params;
  const { senderId, type, content, imageUrl } = message;

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
  const nameSearchFilters = searchInput
    ? buildNameSearchFilters(searchInput)
    : [];

  logger.info(
    { profileId, searchInput: searchInput, limit },
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
              OR: nameSearchFilters,
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
  const nameSearchFilters = searchInput
    ? buildNameSearchFilters(searchInput)
    : [];

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
              OR: nameSearchFilters,
            },
          },
          {
            chat: {
              OR: [
                {
                  name: {
                    contains: searchInput,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  participants: {
                    some: {
                      profile: {
                        OR: nameSearchFilters,
                      },
                    },
                  },
                },
              ],
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
