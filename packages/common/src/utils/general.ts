import { DateTime } from 'luxon';
import { ChatActionDTO, IChatAction } from '../schemas/action';
import {
  ActivityType,
  IChatActionActivity,
  IMessageActivity,
} from '../schemas/activities';

import { IMessage, IMessageWithSender } from '../schemas/message';
import { DateRange, ObjectId } from '../schemas/primitives';

export const getDefaultDateRange = (): DateRange => {
  return {
    startDate: DateTime.now().minus({ days: 7 }),
    endDate: DateTime.now(),
  };
};

interface GetProfileDisplayNameParams {
  firstName: string;
  lastName: string;
}

export function getProfileDisplayName(params: GetProfileDisplayNameParams) {
  const { firstName, lastName } = params;
  return `${firstName} ${lastName}`.trim();
}

interface GetActionDisplayTextParams {
  action: ChatActionDTO;
  profileId?: ObjectId | null;
}

export function getActionDisplayText(params: GetActionDisplayTextParams) {
  const { action, profileId } = params;
  const isActorSelf = profileId != null && action.actorId === profileId;
  const isTargetSelf = profileId != null && action.targetId === profileId;

  const actorLabel = isActorSelf ? 'You' : getProfileDisplayName(action.actor);
  const targetLabel = action.target
    ? isTargetSelf
      ? 'you'
      : getProfileDisplayName(action.target)
    : 'a member';

  switch (action.actionType) {
    case 'CHAT_CREATED': {
      return `${actorLabel} created the chat`;
    }
    case 'MEMBER_ADDED': {
      return `${actorLabel} added ${targetLabel} to the chat`;
    }
    case 'MEMBER_REMOVED': {
      return `${actorLabel} removed ${targetLabel} from the chat`;
    }
    case 'MEMBER_LEFT': {
      return `${actorLabel} left the chat.`;
    }
    case 'NAME_CHANGED': {
      const newName = action.content?.trim();
      return newName
        ? `${actorLabel} changed the chat name to "${newName}"`
        : `${actorLabel} changed the chat name`;
    }
    case 'PICTURE_CHANGED': {
      return `${actorLabel} changed the chat picture`;
    }
    default: {
      return assertNever(action.actionType);
    }
  }
}

export function tagActivity(
  activity: IMessage,
  activityType: 'message'
): IMessageActivity;

export function tagActivity(
  activity: IMessageWithSender,
  activityType: 'message'
): IMessageActivity;

export function tagActivity(
  activity: IChatAction,
  activityType: 'action'
): IChatActionActivity;

export function tagActivity(
  activity: IMessage | IChatAction,
  activityType: ActivityType
) {
  return {
    ...activity,
    activityType,
  };
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
