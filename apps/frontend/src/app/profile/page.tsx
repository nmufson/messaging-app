'use client';

import { useQueryState } from 'nuqs';
import { ProfileContent } from './profileContent';

export default function Profile() {
  const [profileId, setProfileId] = useQueryState('profile');

  if (!profileId) {
    window.location.href = '/chats';
    return;
  }

  return <ProfileContent profileId={profileId} />;
}
