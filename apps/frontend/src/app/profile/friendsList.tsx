'use client';

import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { useFriends } from '@/hooks/profile';
import { useQueryState } from 'nuqs';

export default function FriendsList() {
  const [profileId] = useQueryState('profile');

  const { friends, isLoading, error } = useFriends(profileId);

  // TODO: clean this up
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
        return (
          <ProfilePreview
            key={friend.id}
            profile={friend}
            asLink={`/profile?profile=${friend.id}`}
          />
        );
      })}
    </div>
  );
}
