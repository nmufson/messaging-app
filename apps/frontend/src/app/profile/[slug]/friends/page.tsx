'use client';

import { useTRPC } from '@/lib/trpc';
import { extractUUIDFromSlug } from '@/utils';
import { ListProfileDTO } from '@repo/common';
import { skipToken, useQuery } from '@tanstack/react-query';
import { DEFAULT_PROFILE_IMAGE } from '@/constants';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FriendsList() {
  const trpc = useTRPC();
  const params = useParams();
  const slug = params.slug as string;
  const profileId = extractUUIDFromSlug(slug);

  const {
    data: friends,
    isLoading,
    error,
  } = useQuery(
    trpc.profile.friends.queryOptions(profileId ? { profileId } : skipToken)
  );

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
        return <FriendPreview key={friend.id} friend={friend} />;
      })}
    </div>
  );
}

function FriendPreview({ friend }: { friend: ListProfileDTO }) {
  const { firstName, lastName, profilePictureUrl, id: profileId } = friend;
  const profileDisplayName = `${firstName} ${lastName}`;
  const profileImage = profilePictureUrl
    ? profilePictureUrl
    : DEFAULT_PROFILE_IMAGE;

  return (
    <Link href={`/profile/${profileId}`}>
      <div className="flex items-center p-3 border-b border-grey-200">
        <img
          src={profileImage}
          alt="Profile Picture"
          className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-brand-light"
        />
        <p className="text-lg">{profileDisplayName}</p>
      </div>
    </Link>
  );
}
