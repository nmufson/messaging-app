import { useTRPC } from '@/lib/trpc';
import {
  DurationObject,
  ListProfileWithPresenceDTO,
  ObjectId,
  PresenceUpdate,
} from '@repo/common';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';

export const useProfile = (profileId: ObjectId | null) => {
  const trpc = useTRPC();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery(
    trpc.profile.byId.queryOptions(profileId ? { profileId } : skipToken)
  );

  return {
    profile,
    isLoading,
    error,
  };
};

interface OnlinePresenceOptions {
  chatId?: ObjectId;
  withinLast?: DurationObject;
}

export function useOnlinePresence(options?: OnlinePresenceOptions) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { withinLast } = options || {};

  const friendsPresenceQueryKey =
    trpc.onlinePresence.getFriendsPresence.queryKey({ withinLast });
  const friendsPresenceQueryOptions =
    trpc.onlinePresence.getFriendsPresence.queryOptions({ withinLast });

  const { data, isLoading, error } = useQuery(
    trpc.onlinePresence.getFriendsPresence.queryOptions({ withinLast })
  );

  const { status, error: subscriptionError } = useSubscription(
    trpc.onlinePresence.onPresenceChange.subscriptionOptions(undefined, {
      onData(presenceUpdate) {
        console.log('Received presence update:', presenceUpdate);

        queryClient.setQueryData(friendsPresenceQueryKey, (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((friend) =>
            friend.id === presenceUpdate.profileId
              ? {
                  ...friend,
                  isOnline: presenceUpdate.isOnline,
                  lastOnline: presenceUpdate.lastOnline,
                }
              : friend
          );
        });
      },
      onError(error) {
        console.error('Presence subscription error:', error);
      },
    })
  );

  return {
    activeFriends: data,
    isLoading,
    error,
    subscriptionStatus: status,
    subscriptionError,
  };
}

export function useFriends(profileId: ObjectId | null) {
  const trpc = useTRPC();

  const {
    data: friends,
    isLoading,
    error,
  } = useQuery(
    trpc.profile.friends.queryOptions(profileId ? { profileId } : skipToken)
  );

  return {
    friends,
    isLoading,
    error,
  };
}
