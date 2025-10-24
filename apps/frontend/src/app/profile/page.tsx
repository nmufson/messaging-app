'use client';

import { useQueryState } from 'nuqs';
import { ProfileContent } from './profileContent';

const DEFAULT_PROFILE_PICTURE =
  'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';

export default function Profile() {
  const [profileId, setProfileId] = useQueryState('profile');

  if (!profileId) {
    // ! redirect to home page?
    return null;
  }

  return <ProfileContent profileId={profileId} />;
}
