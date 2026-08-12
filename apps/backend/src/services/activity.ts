import {
  ObjectId,
  DateTimeSchema,
  ActivitiesQueryOptions,
  IMessageWithSender,
  IChatAction,
  IChatActivity,
  SortDirection,
  tagActivity,
} from '@repo/common';
import { PrismaClient } from '@repo/db';
import { DateTime } from 'luxon';

export async function getChatActivities(
  prisma: PrismaClient,
  params: { chatId: ObjectId; cursor?: DateTimeSchema },
  options?: ActivitiesQueryOptions
) {
  const { chatId, cursor } = params;
  const { minActivities = 20, sortDirection = 'desc' } = options || {};

  const endDate = cursor ? cursor : DateTime.now();
  let startDate = endDate.minus({ days: 7 });

  let messages: IMessageWithSender[] = [];
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
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
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
}

export async function getMergedActivities(
  messages: IMessageWithSender[],
  actions: IChatAction[],
  options?: { sortDirection?: SortDirection }
): Promise<IChatActivity[]> {
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
}
