'use client';

import { useTRPC } from '@/lib/trpc';
import { extractUUIDFromSlug } from '@/utils';
import { ListProfileDTO } from '@repo/common';
import { skipToken, useQuery } from '@tanstack/react-query';
import { DEFAULT_PROFILE_IMAGE } from '@/constants';
import { useParams } from 'next/navigation';
import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { useFriends } from '@/hooks/profile';

export default function FriendsList() {
  const trpc = useTRPC();
  const params = useParams();
  const slug = params.slug as string;
  const profileId = extractUUIDFromSlug(slug);

  const { friends, isLoading, error } = useFriends(profileId);

  if (isLoading) {
    return <div>Loading chat...</div>;
  }
  if (error) {
    return <div>Error loading friends list</div>;
  }
  if (!friends) {
    return <div>Friends not found</div>;
  }
  if (!friends.length) {
    return (
      <div>
        User doesn't have any friends <em>yet</em>
      </div>
    );
  }

  return (
    <div>
      {friends.map((friend) => {
        return <FriendProfilePreview key={friend.id} friend={friend} />;
      })}
    </div>
  );
}

function FriendProfilePreview({ friend }: { friend: ListProfileDTO }) {
  return (
    <ProfilePreview profile={friend} asLink={`/profile?profile=${friend.id}`} />
  );
}
