import { ObjectId } from '@repo/common';
import { ChatType } from '@repo/db';
import { DateTime } from 'luxon';

export function formatMessageTime(dt: DateTime) {
  const now = DateTime.now();
  const diffInDays = now.startOf('day').diff(dt.startOf('day'), 'days').days;

  if (dt.hasSame(now, 'day')) {
    return dt.toFormat('h:mm a');
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return dt.toFormat('cccc'); //  "Monday"
  } else {
    // Older than a week
    return dt.toFormat('MM/dd/yyyy');
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
  profilePictureUrl: string | null;
}

interface GetChatNameParams {
  type: ChatType;
  name: string | null;
  participants: ChatParticipant[];
  userId?: ObjectId;
}

export function getChatName(params: GetChatNameParams): string {
  const { type, name, participants, userId } = params;
  const isDirectChat = type === ChatType.DIRECT;

  if (isDirectChat) {
    const otherParticipant = participants.find((p) => p.id !== userId);
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
