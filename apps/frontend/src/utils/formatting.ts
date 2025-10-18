import { DateTimeSchema, ObjectId } from '@repo/common';
import { ChatType } from '@repo/common';
import { DateTime } from 'luxon';

export function formatMessageTime(dt: DateTime) {
  const parsedDateTime = toDateTime(dt);
  if (!parsedDateTime) return '';

  const now = DateTime.now();
  const diffInDays = now
    .startOf('day')
    .diff(parsedDateTime.startOf('day'), 'days').days;

  if (parsedDateTime.hasSame(now, 'day')) {
    return parsedDateTime.toFormat('h:mm a');
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return parsedDateTime.toFormat('cccc'); //  "Monday"
  } else {
    // Older than a week
    return parsedDateTime.toFormat('MM/dd/yyyy');
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
  avatarUrl: string | null;
}

interface GetChatNameParams {
  type: ChatType;
  name: string | null;
  participants: ChatParticipant[];
  profileId?: ObjectId;
}

export function getChatName(params: GetChatNameParams): string {
  const { type, name, participants, profileId } = params;
  const isDirectChat = type === ChatType.enum.DIRECT;

  if (isDirectChat) {
    const otherParticipant = participants.find((p) => p.id !== profileId);
    if (!otherParticipant) return 'Unknown User';
    return `${otherParticipant.firstName} ${otherParticipant.lastName}`;
  }

  // group chat
  if (name) {
    return name;
  }

  const participantNames = participants.map(
    (p) => `${p.firstName} ${p.lastName}`
  );

  return participantNames.join(', ');
}

export function toDateTime(date: unknown): DateTime | null {
  return DateTimeSchema.parse(date);
}

export function formatDate(dateTime: DateTime): string {
  const now = DateTime.local();

  if (dateTime.hasSame(now, 'day')) {
    return 'today';
  }

  if (dateTime.hasSame(now.minus({ days: 1 }), 'day')) {
    return 'yesterday';
  }

  if (dateTime.year === now.year) {
    return `on ${dateTime.toFormat('cccc')}`;
  }

  return `on ${dateTime.toFormat('MMMM d')}`;
}
