import { DateTimeSchema, ObjectId } from '@repo/common';
import { DateTime } from 'luxon';
import * as R from 'remeda';

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

interface GetChatDisplayNameParams {
  name: string | null;
  participants: ChatParticipant[];
  profileId?: ObjectId;
  truncate?: number;
}

export function getChatDisplayName(params: GetChatDisplayNameParams): string {
  const { name, participants, profileId, truncate } = params;

  // group chat with name
  if (name) {
    return name;
  }

  const participantNames = participants
    .filter((p) => p.id !== profileId)
    .map((p) => `${p.firstName} ${p.lastName}`);

  const joined = participantNames.join(', ');

  if (truncate) {
    return R.truncate(joined, truncate);
  }
  return joined;
}

interface GetProfileDisplayNameParams {
  firstName: string;
  lastName: string;
}

export function getProfileDisplayName({
  firstName,
  lastName,
}: GetProfileDisplayNameParams): string {
  return `${firstName} ${lastName}`;
}

export function toDateTime(date: unknown): DateTime | null {
  return DateTimeSchema.parse(date);
}
