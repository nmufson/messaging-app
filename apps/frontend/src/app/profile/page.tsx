'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { ProfileContent } from './profileContent';

function ProfilePageContent() {
  const [profileId] = useQueryState('profile');
  const router = useRouter();

  useEffect(() => {
    if (!profileId) {
      router.replace('/chats');
    }
  }, [profileId, router]);

  if (!profileId) return null;

  return <ProfileContent profileId={profileId} />;
}

export default function Profile() {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent />
    </Suspense>
  );
}
