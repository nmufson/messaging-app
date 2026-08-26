import { logger } from '@/lib/pino';
import {
  ChatInfoDTO,
  ChatType,
  IBaseProfile,
  IChatListItem,
  ObjectId,
} from '@repo/common';
import { PrismaClient } from '@repo/db';

export const CHAT_INFO_SELECT = {
  id: true,
  type: true,
  name: true,
  groupPictureUrl: true,
  lastActivityAt: true,
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
      actor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      target: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  },
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
        },
      },
    },
  },
} as const;

interface GetPotentialChatsParams {
  profileId: ObjectId;
  searchNames: string[];
  selectedProfiles?: ObjectId[];
  requireInput?: boolean;
  includeOnlyExistingChats?: boolean;
  limit?: number;
}

interface ProfileExclusionConditionParams {
  selectedProfiles?: ObjectId[];
}

interface ProfileSearchConditionParams {
  searchNames: string[];
}

interface ExistingDirectChatConditionParams {
  includeOnlyExistingChats?: boolean;
  profileId: ObjectId;
}

function getProfileExclusionCondition(params: ProfileExclusionConditionParams) {
  const { selectedProfiles } = params;

  if (!selectedProfiles || selectedProfiles.length === 0) {
    return {};
  }

  return {
    id: { notIn: selectedProfiles },
  };
}

function getProfileSearchCondition(params: ProfileSearchConditionParams) {
  const { searchNames } = params;

  if (searchNames.length === 0) {
    return {};
  }

  return {
    OR: searchNames.flatMap((searchName) => [
      {
        firstName: { contains: searchName, mode: 'insensitive' as const },
      },
      {
        lastName: { contains: searchName, mode: 'insensitive' as const },
      },
    ]),
  };
}

function getGroupChatSearchCondition(params: ProfileSearchConditionParams) {
  const { searchNames } = params;

  if (searchNames.length === 0) {
    return {};
  }

  return {
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
  };
}

function getExistingDirectChatCondition(
  params: ExistingDirectChatConditionParams
) {
  const { includeOnlyExistingChats, profileId } = params;

  if (!includeOnlyExistingChats) {
    return {};
  }

  return {
    chatMemberships: {
      some: {
        chat: {
          type: ChatType.enum.DIRECT,
          participants: {
            some: {
              profileId,
            },
          },
        },
      },
    },
  };
}

function getFriendsCondition(profileId: ObjectId) {
  return {
    friends: {
      some: { id: profileId },
    },
  };
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
  const {
    searchNames,
    selectedProfiles,
    profileId,
    limit,
    requireInput,
    includeOnlyExistingChats,
  } = params;

  if (requireInput && searchNames.length === 0)
    return { profiles: [], groupChats: [] };

  const exclusionCondition = getProfileExclusionCondition({
    selectedProfiles,
  });
  const profileSearchCondition = getProfileSearchCondition({ searchNames });
  const friendsCondition = getFriendsCondition(profileId);
  const existingDirectChatCondition = getExistingDirectChatCondition({
    includeOnlyExistingChats,
    profileId,
  });

  const profiles = await prisma.profile.findMany({
    where: {
      ...friendsCondition,
      ...profileSearchCondition,
      ...exclusionCondition,
      ...existingDirectChatCondition,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
    take: limit ?? 10,
  });

  const groupChatSearchCondition = getGroupChatSearchCondition({
    searchNames,
  });

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
    const uniqueParticipantProfileIds = Array.from(
      new Set(participantProfileIds)
    );

    whereFilters = {
      AND: [
        {
          participants: {
            every: {
              profileId: { in: uniqueParticipantProfileIds },
            },
          },
        },
        ...uniqueParticipantProfileIds.map((profileId) => ({
          participants: {
            some: {
              profileId,
            },
          },
        })),
      ],
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
      lastActivityAt: true,
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

interface MarkChatAsReadParams {
  chatId: ObjectId;
  profileId: ObjectId;
}

export async function markChatAsRead(
  prisma: PrismaClient,
  params: MarkChatAsReadParams
): Promise<void> {
  const { chatId, profileId } = params;

  await prisma.chatParticipant.update({
    where: {
      chatId_profileId: {
        chatId,
        profileId,
      },
    },
    data: {
      unreadActivities: 0,
      lastViewedAt: new Date(),
    },
  });
}
