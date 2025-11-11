import * as R from 'remeda';

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  className?: string;
  size?: number;
  rounded?: boolean;
}

export function ProfileAvatar(props: ProfileAvatarProps) {
  const {
    firstName,
    lastName,
    avatarUrl,
    className = '',
    size = 40,
    rounded = true,
  } = props;
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
