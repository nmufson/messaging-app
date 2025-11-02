import { DateTimeSchema, ObjectId } from '@repo/common';
import { DateTime } from 'luxon';

export function formatDisplayDate(
  dt: DateTime,
  options?: { withPreposition?: boolean }
): string {
  const { withPreposition = false } = options || {};
  const now = DateTime.now();
  const diffInDays = now.startOf('day').diff(dt.startOf('day'), 'days').days;

  if (dt.hasSame(now, 'day')) {
    return dt.toFormat('h:mm a');
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return withPreposition ? `on ${dt.toFormat('cccc')}` : dt.toFormat('cccc');
  } else if (dt.year !== now.year) {
    // a previous calendar year
    return withPreposition
      ? `on ${dt.toFormat('MMMM d, yyyy')}`
      : dt.toFormat('MMMM d, yyyy');
  } else {
    // Older than a week, but same year
    return withPreposition
      ? `on ${dt.toFormat('MMMM d')}`
      : dt.toFormat('MMMM d');
  }
}
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

interface ChatParticipant {
  id: ObjectId;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

interface GetChatNameParams {
  name: string | null;
  participants: ChatParticipant[];
  profileId?: ObjectId;
}

export function getChatName(params: GetChatNameParams): string {
  const { name, participants, profileId } = params;

  // group chat with name
  if (name) {
    return name;
  }

  const participantNames = participants
    .filter((p) => p.id !== profileId)
    .map((p) => `${p.firstName} ${p.lastName}`);

  return participantNames.join(', ');
}

export function toDateTime(date: unknown): DateTime | null {
  return DateTimeSchema.parse(date);
}
