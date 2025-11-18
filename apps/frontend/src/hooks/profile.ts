import { useTRPC } from '@/lib/trpc';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DurationObject,
  ListProfileWithPresenceDTO,
  ObjectId,
  PresenceUpdate,
} from '@repo/common';
import { useSubscription } from '@trpc/tanstack-react-query';
import type { RouterOutputs } from '@/lib/trpc';

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

  const {
    data: friendsWithPresence,
    isLoading,
    error,
  } = useQuery(friendsPresenceQueryOptions);

  const { status, error: subscriptionError } = useSubscription(
    trpc.onlinePresence.onPresenceChange.subscriptionOptions(undefined, {
      onData(presenceUpdate: PresenceUpdate) {
        console.log('Received presence update:', presenceUpdate);

        queryClient.setQueryData(
          friendsPresenceQueryKey,
          (oldData: ListProfileWithPresenceDTO[] | undefined) => {
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
          }
        );
      },
    })
  );

  return {
    friendsWithPresence,
    isLoading,
    error,
    subscriptionStatus: status,
    subscriptionError,
  };
}
