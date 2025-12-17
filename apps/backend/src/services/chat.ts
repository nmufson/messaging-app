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
} from '@repo/common';
import { ChatActionType, prisma, PrismaClient } from '@repo/db';
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

  return ChatInfoDTO.parse(chat);
};

export const getMergedActivities = async (
  messages: IMessage[],
  actions: IChatAction[]
) => {
  const messageActivities = messages.map((msg) => ({
    ...msg,
    activityType: 'message' as const,
  }));

  const actionActivities = actions.map((action) => ({
    ...action,
    activityType: 'action' as const,
  }));

  const mergedActivities = [...messageActivities, ...actionActivities].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const activityProfileIds = [
    ...mergedActivities.map((a) => {
      if (a.activityType === 'message') {
        return a.senderId;
      } else {
        return a.targetId ? [a.actorId, a.targetId] : [a.actorId];
      }
    }),
  ].flat();

  const uniqueProfileIds = [...new Set(activityProfileIds)];

  const profiles = await prisma.profile.findMany({
    where: { id: { in: uniqueProfileIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  });

  return {
    mergedActivities,
    activityProfiles: profiles,
  };
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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isOnline: true,
      lastOnline: true,
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

  const newActionActivity = {
    ...restOfAction,
    activityType: 'action' as const,
  };

  return {
    newActionActivity,
    activityProfiles: target ? [actor, target] : [actor],
  };
};

const MIN_ACTIVITIES = 20;

export const getChatActivities = async (
  prisma: PrismaClient,
  params: { chatId: ObjectId; cursor?: DateTimeSchema }
) => {
  const { chatId, cursor } = params;
  const endDate = cursor ? cursor : DateTime.now();
  let startDate = endDate.minus({ days: 7 });

  let messages: IMessage[] = [];
  let actions: IChatAction[] = [];
  let activityCount = 0;

  while (activityCount < MIN_ACTIVITIES) {
    messages = await prisma.message.findMany({
      where: {
        chatId,
        createdAt: {
          gte: startDate.toJSDate(),
          lt: endDate.toJSDate(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    actions = await prisma.chatAction.findMany({
      where: {
        chatId,
        createdAt: {
          gte: startDate.toJSDate(),
          lt: endDate.toJSDate(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    activityCount = messages.length + actions.length;

    if (activityCount >= MIN_ACTIVITIES) {
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

  const { mergedActivities, activityProfiles } = await getMergedActivities(
    messages,
    actions
  );

  const hasOlderActivities =
    (await prisma.message.findFirst({
      where: { chatId, createdAt: { lt: startDate.toJSDate() } },
    })) ||
    (await prisma.chatAction.findFirst({
      where: { chatId, createdAt: { lt: startDate.toJSDate() } },
    }));

  return {
    activities: mergedActivities,
    activityProfiles,
    nextCursor: hasOlderActivities ? startDate.toJSDate() : null,
  };
};
