'use client';

import { useQueryState } from 'nuqs';
import { ProfileContent } from './profileContent';

export default function Profile() {
  const [profileId, setProfileId] = useQueryState('profile');

  if (!profileId) {
    // ! redirect to home page?
    return null;
  }

  return <ProfileContent profileId={profileId} />;
}
