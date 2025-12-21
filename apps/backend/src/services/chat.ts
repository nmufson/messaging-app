import { logger } from '@/lib/pino';
import {
  ChatInfoDTO,
  ChatListDTO,
  ChatType,
  DateTimeSchema,
  IChatAction,
  IMessage,
  ListProfileDTO,
  ObjectId,
  ReactionEmoji,
  SortDirection,
  tagActivity,
} from '@repo/common';
import {
  ActivitiesQueryOptions,
  IChatActivity,
} from '@repo/common/schemas/activities';
import { ChatActionType, prisma, PrismaClient } from '@repo/db';
import { profile } from 'console';
import { DateTime } from 'luxon';

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

  let groupChats: ChatListDTO[] = [];
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
): Promise<ChatInfoDTO | null> => {
  const { chatId, profileIds } = params;

  logger.info({ chatId, profileIds }, 'Getting chat info');

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
    logger.info({ chatId, profileIds }, 'Chat not found');
    return null;
  }

  return ChatInfoDTO.parse(chat);
};

export const getMergedActivities = async (
  messages: IMessage[],
  actions: IChatAction[],
  options?: { sortDirection?: SortDirection }
): Promise<IChatActivity[]> => {
  const { sortDirection = 'desc' } = options || {};

  const messageActivities = messages.map((msg) => tagActivity(msg, 'message'));

  const actionActivities = actions.map((action) =>
    tagActivity(action, 'action')
  );

  const mergedActivities = [...messageActivities, ...actionActivities].sort(
    (a, b) =>
      sortDirection === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
  );

  return mergedActivities;
};

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

export const updateChatInfo = async (
  prisma: PrismaClient,
  params: UpdateChatInfoParams
) => {
  const { chatId, data } = params;

  logger.info({ chatId, data }, 'Updating chat info');

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data,
    select: CHAT_INFO_SELECT,
  });

  return updatedChat;
};

interface ActionData {
  chatId: ObjectId;
  actionType: ChatActionType;
  actorId: ObjectId;
  targetId?: ObjectId;
  content?: string | null;
}

export const createAction = async (prisma: PrismaClient, data: ActionData) => {
  const newAction = await prisma.chatAction.create({
    data,
    select: {
      id: true,
      chatId: true,
      actionType: true,
      actorId: true,
      targetId: true,
      createdAt: true,
      content: true,
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
  });

  const { actor, target, ...restOfAction } = newAction;

  const newActionActivity = tagActivity(newAction, 'action');

  return {
    newActionActivity,
    activityProfiles: target ? [actor, target] : [actor],
  };
};

export const getChatActivities = async (
  prisma: PrismaClient,
  params: { chatId: ObjectId; cursor?: DateTimeSchema },
  options?: ActivitiesQueryOptions
) => {
  const { chatId, cursor } = params;
  const { minActivities = 20, sortDirection = 'desc' } = options || {};

  const endDate = cursor ? cursor : DateTime.now();
  let startDate = endDate.minus({ days: 7 });

  let messages: IMessage[] = [];
  let actions: IChatAction[] = [];
  let activityCount = 0;

  while (activityCount < minActivities) {
    messages = await prisma.message.findMany({
      where: {
        chatId,
        createdAt: {
          gte: startDate.toJSDate(),
          lt: endDate.toJSDate(),
        },
        type: { not: 'REACTION' },
      },
      include: {
        replies: {
          where: { type: 'REACTION' },
          select: {
            id: true,
            type: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { createdAt: sortDirection },
    });

    actions = await prisma.chatAction.findMany({
      where: {
        chatId,
        createdAt: {
          gte: startDate.toJSDate(),
          lt: endDate.toJSDate(),
        },
      },
      orderBy: { createdAt: sortDirection },
    });

    activityCount = messages.length + actions.length;

    if (activityCount >= minActivities) {
      break;
    }

    // check for older activities before extending range to avoid infinite loop
    const olderExists =
      (await prisma.message.findFirst({
        where: { chatId, createdAt: { lt: startDate.toJSDate() } },
      })) ||
      (await prisma.chatAction.findFirst({
        where: { chatId, createdAt: { lt: startDate.toJSDate() } },
      }));

    if (!olderExists) {
      break;
    }

    // extend range
    const currentDuration = endDate.diff(startDate, 'days').days;
    startDate = startDate.minus({ days: currentDuration });
  }

  const mergedActivities = await getMergedActivities(messages, actions, {
    sortDirection,
  });

  const hasOlderActivities =
    (await prisma.message.findFirst({
      where: { chatId, createdAt: { lt: startDate.toJSDate() } },
    })) ||
    (await prisma.chatAction.findFirst({
      where: { chatId, createdAt: { lt: startDate.toJSDate() } },
    }));

  return {
    activities: mergedActivities,
    nextCursor: hasOlderActivities ? startDate.toJSDate() : null,
  };
};
