import { PROFILE_FALLBACK } from '@/constants';
import * as R from 'remeda';

interface ProfileInfo {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

interface ProfileAvatarProps {
  profile?: ProfileInfo | null;
  className?: string;
  size?: number;
  rounded?: boolean;
}

export function ProfileAvatar(props: ProfileAvatarProps) {
  const { profile, className = '', size = 40, rounded = true } = props;
  const { firstName, lastName, avatarUrl } = profile ?? PROFILE_FALLBACK;

  const initials = R.toUpperCase(`${firstName[0]}${lastName[0]}`);
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={`${firstName} ${lastName}`}
      className={`${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`flex items-center justify-center bg-gray-300 text-white font-bold ${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size / 2 }}
    >
      {initials}
    </div>
  );
}
