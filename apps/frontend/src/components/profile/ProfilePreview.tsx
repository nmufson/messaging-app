import { DEFAULT_PROFILE_IMAGE } from '@/constants';
import { ListProfileDTO } from '@repo/common';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ProfilePreviewProps {
  profile: ListProfileDTO;
  onClick?: () => void;
  rightContent?: ReactNode;
  asLink?: string; // wraps in link if provided
  className?: string;
}

export function ProfilePreview(props: ProfilePreviewProps) {
  const { profile, onClick, rightContent, asLink, className } = props;
  const { firstName, lastName, avatarUrl } = profile;
  const profileDisplayName = `${firstName} ${lastName}`;
  const profileImage = avatarUrl ? avatarUrl : DEFAULT_PROFILE_IMAGE;

  const content = (
    <div
      className={`flex items-center p-3 border-b border-grey-200 w-full text-left cursor-pointer ${className ?? ''}`}
      onClick={onClick}
    >
      <img
        src={profileImage}
        alt="Profile Picture"
        className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-brand-light"
      />
      <p className="text-lg flex-1">{profileDisplayName}</p>
      {rightContent}
    </div>
  );

  if (asLink) {
    return <Link href={asLink}>{content}</Link>;
  }
  return content;
}
