import { ChatDTO } from '@common/src/schemas/chat';
import { ChatType } from '@db/dist';
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

interface GetChatNameParams {
  type: ChatType;
  name: string | null;
  participants: Array<{ firstName: string; lastName: string }>;
}

export function getChatName(params: GetChatNameParams): string {
  const { type, name, participants } = params;
  const isGroupChat = type === ChatType.GROUP;

  if (isGroupChat && name) {
    return name;
  }

  const participantNames = participants.map(
    (p) => `${p.firstName} ${p.lastName}`
  );

  return participantNames.join(', ');
}
