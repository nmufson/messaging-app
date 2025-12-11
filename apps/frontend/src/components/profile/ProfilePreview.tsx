import { DEFAULT_PROFILE_IMAGE } from '@/constants';
import { getOnlineStatus } from '@/utils';
import { ListProfileDTO } from '@repo/common';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ProfilePreviewProps {
  profile: ListProfileDTO;
  onClick?: () => void;
  rightContent?: ReactNode;
  asLink?: string; // wraps in link if provided
  showPresence?: boolean;
  className?: string;
}

export function ProfilePreview(props: ProfilePreviewProps) {
  const { profile, onClick, rightContent, asLink, showPresence, className } =
    props;
  const { firstName, lastName, avatarUrl } = profile;
  const profileDisplayName = `${firstName} ${lastName}`;
  const profileImage = avatarUrl ? avatarUrl : DEFAULT_PROFILE_IMAGE;

  const { color, message } = getOnlineStatus({
    isOnline: profile.isOnline,
    lastOnline: profile.lastOnline,
  });

  const presenceDisplay = (
    <div className="flex items-center justify-start gap-1">
      <i className={`bi bi-dot text-2xl ${color}`}></i>
      <span className={`text-sm ${color}`}>{message}</span>
    </div>
  );

  const content = (
    <div
      className={`group flex items-center p-3 border-b border-grey-200 w-full text-left cursor-pointer ${className ?? ''}`}
      onClick={onClick}
    >
      <img
        src={profileImage}
        alt="Profile Picture"
        className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-brand-light"
      />
      <div className="flex-1">
        <p className="text-lg">{profileDisplayName}</p>
        {showPresence && presenceDisplay}
      </div>
      {rightContent}
    </div>
  );

  if (asLink) {
    return (
      <Link href={asLink} className="no-underline text-inherit">
        {content}
      </Link>
    );
  }
  return content;
}
