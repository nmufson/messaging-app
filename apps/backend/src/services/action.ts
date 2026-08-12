import { eventEmitter } from '@/lib/eventBus';
import { logger } from '@/lib/pino';
import { ObjectId, tagActivity } from '@repo/common';
import { Chat, ChatActionType, PrismaClient } from '@repo/db';
import { incrementUnreadActivityCount } from './message';

interface ActionData {
  chatId: ObjectId;
  actionType: ChatActionType;
  actorId: ObjectId;
  targetId?: ObjectId;
  content?: string | null;
}

export async function createAction(prisma: PrismaClient, data: ActionData) {
  const { chatId, actorId } = data;

  logger.info({ data }, 'Creating chat action');

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

  await incrementUnreadActivityCount(prisma, chatId, actorId);

  const { actor, target, ...restOfAction } = newAction;
  const newActionActivity = tagActivity(newAction, 'action');

  logger.info({ newActionActivity }, 'Emitting action activity');
  eventEmitter.emit(`activity:create:${chatId}`, newActionActivity);

  return {
    newActionActivity,
    activityProfiles: target ? [actor, target] : [actor],
  };
}
