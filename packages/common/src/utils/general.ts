import { DateTime } from 'luxon';
// TODO: fix these import paths
import { IChatAction } from 'src/schemas/action';
import {
  ActivityType,
  IChatActionActivity,
  IMessageActivity,
} from 'src/schemas/activities';

import { IMessage } from 'src/schemas/message';
import { DateRange } from 'src/schemas/primitives';

export const getDefaultDateRange = (): DateRange => {
  return {
    startDate: DateTime.now().minus({ days: 7 }),
    endDate: DateTime.now(),
  };
};

export function tagActivity(
  activity: IMessage,
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
