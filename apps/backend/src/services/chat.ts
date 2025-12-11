import { ChatDTO, ChatType, ListProfileDTO, ChatListDTO } from '@repo/common';
import { Chat, Profile } from '@repo/db';
import { PrismaClient } from '@repo/db';
import { ObjectId } from '@repo/common';
import { logger } from '@/lib/pino';

// TODO make endpoint for finding direct chat and use this there

interface GetPotentialChatsParams {
  profileId: ObjectId;
  searchNames: string[];
  selectedProfiles?: ObjectId[];
  requireInput?: boolean;
  limit?: number;
}

// Returns profiles and existing group chats for user to begin chat
// Doesn't include profiles that are already included in the user's potential chat list
export const getPotentialChats = async (
  prisma: PrismaClient,
  params: GetPotentialChatsParams
): Promise<{ profiles: ListProfileDTO[]; groupChats: ChatListDTO[] }> => {
  const { searchNames, selectedProfiles, profileId, limit, requireInput } =
    params;

  if (requireInput && searchNames.length === 0)
    return { profiles: [], groupChats: [] };

  // exclusion condition for profiles already selected
  const exclusionCondition =
    selectedProfiles && selectedProfiles.length > 0
      ? { id: { notIn: selectedProfiles } }
      : {};

  const profileSearchCondition =
    searchNames.length > 0
      ? {
          OR: searchNames.flatMap((searchName) => [
            {
              firstName: { contains: searchName, mode: 'insensitive' as const },
            },
            {
              lastName: { contains: searchName, mode: 'insensitive' as const },
            },
          ]),
        }
      : {};

  const friendsCondition = {
    friends: {
      some: { id: profileId },
    },
  };

  const profiles = await prisma.profile.findMany({
    where: {
      ...friendsCondition,
      ...profileSearchCondition,
      ...exclusionCondition,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
    take: limit ?? 10,
  });

  const groupChatSearchCondition =
    searchNames.length > 0
      ? {
          OR: [
            ...searchNames.map((searchName) => ({
              name: { contains: searchName, mode: 'insensitive' as const },
            })),
            {
              participants: {
                some: {
                  OR: searchNames.flatMap((name) => [
                    {
                      firstName: {
                        contains: name,
                        mode: 'insensitive' as const,
                      },
                    },
                    {
                      lastName: {
                        contains: name,
                        mode: 'insensitive' as const,
                      },
                    },
                  ]),
                },
              },
            },
          ],
        }
      : {};

  let groupChats: ChatListDTO[] = [];
  if (!selectedProfiles || selectedProfiles.length === 0) {
    groupChats = await prisma.chat.findMany({
      where: {
        type: ChatType.enum.GROUP,
        participants: {
          some: { id: profileId },
        },
        ...groupChatSearchCondition,
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      take: limit ?? 10,
    });
  }

  return { profiles, groupChats };
};

interface GetChatParams {
  chatId?: ObjectId;
  profileIds?: ObjectId[];
}

export const getChat = async (
  prisma: PrismaClient,
  params: GetChatParams
): Promise<ChatDTO | null> => {
  const { chatId, profileIds } = params;

  logger.info({ chatId, profileIds }, 'Getting chat with params');

  let whereFilters;

  if (chatId) {
    whereFilters = { id: chatId };
  } else if (profileIds) {
    whereFilters = {
      participants: {
        every: {
          id: { in: profileIds },
        },
      },
    };
  }

  if (!whereFilters) {
    return null;
  }

  const chat = await prisma.chat.findFirst({
    where: whereFilters,
    select: {
      id: true,
      type: true,
      name: true,
      groupPictureUrl: true,
      createdAt: true,
      updatedAt: true,
      creatorId: true,
      messages: {
        take: 100,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          imageUrl: true,
          senderId: true,
        },
      },
      actions: {
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          chatId: true,
          actionType: true,
          actorId: true,
          targetId: true,
          createdAt: true,
        },
      },
      // TODO: perhaps don't need this
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isOnline: true,
          lastOnline: true,
        },
      },
    },
  });

  if (!chat) {
    logger.info({ chatId, profileIds }, 'Chat not found');
    return null;
  }

  const senderIds = [...new Set(chat.messages.map((m) => m.senderId))];

  // fetch sender info by messages to account for participants who left or were remvoed
  const senders = await prisma.profile.findMany({
    where: { id: { in: senderIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  });

  return ChatDTO.parse({ ...chat, senders });
};
