import { ChatActivityDTO } from 'src/schemas/activities';

export function checkIsActivityCreator(
  profileId: string,
  activity: ChatActivityDTO
): boolean {
  if (activity.activityType === 'action') {
    return activity.actorId === profileId;
  } else if (activity.activityType === 'message') {
    return activity.senderId === profileId;
  }
  return false;
}
