import { logger } from '@/lib/pino';
import {
  ChatInfoDTO,
  ChatListItemDTO,
  ChatType,
  IBaseProfile,
  IChatListItem,
  ObjectId,
} from '@repo/common';
import { PrismaClient } from '@repo/db';

interface GetPotentialChatsParams {
  profileId: ObjectId;
  searchNames: string[];
  selectedProfiles?: ObjectId[];
  requireInput?: boolean;
  limit?: number;
}

// Returns profiles and existing group chats for user to begin chat
// Doesn't include profiles that are already included in the user's potential chat list
export async function getPotentialChats(
  prisma: PrismaClient,
  params: GetPotentialChatsParams
): Promise<{
  profiles: IBaseProfile[];
  groupChats: IChatListItem[];
}> {
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
                  profile: {
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
            },
          ],
        }
      : {};

  let groupChats: IChatListItem[] = [];
  if (!selectedProfiles || selectedProfiles.length === 0) {
    groupChats = await prisma.chat.findMany({
      where: {
        type: ChatType.enum.GROUP,
        participants: {
          some: { profileId },
        },
        ...groupChatSearchCondition,
      },
      select: {
        id: true,
        type: true,
        name: true,
        groupPictureUrl: true,
        participants: {
          select: {
            lastViewedAt: true,
            unreadActivities: true,
            profile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                lastOnline: true,
                isOnline: true,
              },
            },
          },
        },
      },
      take: limit ?? 10,
    });
  }

  return { profiles, groupChats };
}

interface GetChatParams {
  chatId?: ObjectId;
  participantProfileIds?: ObjectId[];
}

export async function getChat(
  prisma: PrismaClient,
  params: GetChatParams
): Promise<ChatInfoDTO | null> {
  const { chatId, participantProfileIds } = params;

  logger.info({ chatId, participantProfileIds }, 'Getting chat info');

  let whereFilters;

  if (chatId) {
    whereFilters = { id: chatId };
  } else if (participantProfileIds) {
    whereFilters = {
      participants: {
        every: {
          id: { in: participantProfileIds },
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
      participants: {
        select: {
          lastViewedAt: true,
          unreadActivities: true,
          profile: {
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
      },
    },
  });

  if (!chat) {
    logger.info(
      { chatId, profileIds: participantProfileIds },
      'Chat not found'
    );
    return null;
  }

  return ChatInfoDTO.parse(chat);
}

const CHAT_INFO_SELECT = {
  id: true,
  type: true,
  name: true,
  groupPictureUrl: true,
  createdAt: true,
  updatedAt: true,
  creatorId: true,
  actions: {
    take: 100,
    orderBy: { createdAt: 'asc' } as const,
    select: {
      id: true,
      chatId: true,
      actionType: true,
      actorId: true,
      targetId: true,
      createdAt: true,
    },
  },
  participants: {
    where: {
      status: 'MEMBER',
    },
    select: {
      lastViewedAt: true,
      unreadActivities: true,
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
} as const;

interface UpdateChatInfoParams {
  chatId: ObjectId;
  data: {
    participants?: {
      connect?: { id: ObjectId };
      disconnect?: { id: ObjectId };
    };
    name?: string | null;
    groupPictureUrl?: string | null;
  };
}

export async function updateChatInfo(
  prisma: PrismaClient,
  params: UpdateChatInfoParams
) {
  const { chatId, data } = params;

  logger.info({ chatId, data }, 'Updating chat info');

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data,
    select: CHAT_INFO_SELECT,
  });

  return updatedChat;
}
