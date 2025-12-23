import {
  IBaseProfile,
  ChatParticipantDTO,
  DateTimeSchema,
  ObjectId,
  BaseProfileDTO,
} from '@repo/common';
import { DateTime } from 'luxon';
import * as R from 'remeda';

export function formatDisplayDate(
  dt: DateTime,
  options?: { withPreposition?: boolean; includeTime?: boolean }
): string {
  const { withPreposition = false, includeTime = false } = options || {};
  const now = DateTime.now();
  const diffInDays = now.startOf('day').diff(dt.startOf('day'), 'days').days;
  const timeStr = includeTime ? `, ${dt.toFormat('h:mm a')}` : '';

  if (dt.hasSame(now, 'day')) {
    return dt.toFormat('h:mm a');
  } else if (diffInDays === 1) {
    return `Yesterday${timeStr}`;
  } else if (diffInDays < 7) {
    const dayStr = withPreposition
      ? `on ${dt.toFormat('cccc')}`
      : dt.toFormat('cccc');
    return `${dayStr}${timeStr}`;
  } else if (dt.year !== now.year) {
    // a previous calendar year
    const dateStr = withPreposition
      ? `on ${dt.toFormat('MMMM d, yyyy')}`
      : dt.toFormat('MMMM d, yyyy');
    return `${dateStr}${timeStr}`;
  } else {
    // Older than a week, but same year
    const dateStr = withPreposition
      ? `on ${dt.toFormat('MMMM d')}`
      : dt.toFormat('MMMM d');
    return `${dateStr}${timeStr}`;
  }
}
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

interface GetChatDisplayNameParams {
  name: string | null;
  participantProfiles?: Omit<BaseProfileDTO, 'avatarUrl'>[];
  profileId?: ObjectId;
  truncate?: number;
}

export function getChatDisplayName(params: GetChatDisplayNameParams): string {
  const { name, participantProfiles = [], profileId, truncate } = params;

  // group chat with name
  if (name) {
    return name;
  }

  const participantNames = participantProfiles
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

const PRESENCE_COLORS = {
  online: 'text-green-900',
  recentlyActive: 'text-yellow-600',
  offline: 'text-black',
} as const;

interface GetOnlineStatusParams {
  isOnline?: boolean | null;
  lastOnline?: DateTimeSchema | null;
}

interface OnlineStatus {
  color: string;
  message: string | null;
}

export function getOnlineStatus(params: GetOnlineStatusParams): OnlineStatus {
  const { isOnline, lastOnline } = params;

  if (isOnline) {
    return {
      color: PRESENCE_COLORS.online,
      message: 'online now',
    };
  }

  if (!lastOnline) {
    return {
      color: PRESENCE_COLORS.offline,
      message: 'Offline',
    };
  }

  const now = DateTime.now();

  // last online today
  if (lastOnline.hasSame(now, 'day')) {
    const diffInMinutes = now.diff(lastOnline, 'minutes').minutes;
    const diffInHours = now.diff(lastOnline, 'hours').hours;
    let timeAgo: string;

    if (diffInMinutes < 1) {
      timeAgo = 'just now';
    } else if (diffInMinutes < 60) {
      const mins = Math.floor(diffInMinutes);
      timeAgo = `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      const hours = Math.floor(diffInHours);
      timeAgo = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    return {
      color: PRESENCE_COLORS.recentlyActive,
      message: `last online ${timeAgo}`,
    };
  }

  // before today
  return {
    color: PRESENCE_COLORS.offline,
    message: `last online ${formatDisplayDate(lastOnline)}`,
  };
}

interface FriendsOnlineSummaryParams {
  numOnline: number;
  numRecentlyActive: number;
}

interface FriendsOnlineSummary {
  dotColor: string;
  message: string;
}

export function getFriendsOnlineSummary(
  params: FriendsOnlineSummaryParams
): FriendsOnlineSummary {
  const { numOnline, numRecentlyActive } = params;

  if (numOnline > 0) {
    return {
      dotColor: PRESENCE_COLORS.online,
      message: `${numOnline} online`,
    };
  }

  if (numRecentlyActive > 0) {
    return {
      dotColor: PRESENCE_COLORS.recentlyActive,
      message: `${numRecentlyActive} recently active`,
    };
  }

  return {
    dotColor: PRESENCE_COLORS.offline,
    message: 'None online',
  };
}

interface NameDisplay {
  isSelf: boolean;
  profile: BaseProfileDTO;
}

export function getNameDisplay({ isSelf, profile }: NameDisplay) {
  return isSelf ? 'You' : `${profile.firstName} ${profile.lastName}`;
}
