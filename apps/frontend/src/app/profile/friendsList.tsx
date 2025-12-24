'use client';

import DataStatus from '@/components/DataStatus';
import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { useFriends } from '@/hooks/profile';
import { useQueryState } from 'nuqs';

export default function FriendsList() {
  const [profileId] = useQueryState('profile');

  const { friends, isLoading, error } = useFriends(profileId);

  return (
    <div>
      <DataStatus
        data={friends}
        isLoading={isLoading}
        error={error}
        resourceName={'friends'}
      >
        {friends?.map((friend) => {
          return (
            <ProfilePreview
              key={friend.id}
              profile={friend}
              asLink={`/profile?profile=${friend.id}`}
            />
          );
        })}
      </DataStatus>
    </div>
  );
}
