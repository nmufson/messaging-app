import { useTRPC } from '@/lib/trpc';
import { DurationObject, ObjectId, PresenceUpdate } from '@repo/common';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useMemo } from 'react';

// TODO: combine these into one hook, disabling other based on if chatId is provided??
interface OnlinePresenceOptions {
  chatId?: ObjectId;
  withinLast?: DurationObject;
}
// general online presence of friends
export function useOnlinePresence(options?: OnlinePresenceOptions) {
  const { chatId } = options || {};
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryKey = trpc.onlinePresence.getFriendsPresence.queryKey(options);

  const { data, isLoading, error } = useQuery(
    trpc.onlinePresence.getFriendsPresence.queryOptions(options)
  );

  const handlePresenceUpdate = (presenceUpdate: PresenceUpdate) => {
    console.log('Received presence update:', presenceUpdate);

    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return oldData.map((profile) =>
        profile.id === presenceUpdate.profileId
          ? {
              ...profile,
              isOnline: presenceUpdate.isOnline,
              lastOnline: presenceUpdate.lastOnline,
            }
          : profile
      );
    });
  };

  const handlePresenceError = (error: unknown) => {
    console.error('Presence subscription error:', error);
  };

  const { status, error: subscriptionError } = useSubscription(
    trpc.onlinePresence.onPresenceChange.subscriptionOptions(
      // disable general subscription if specific chatId provided
      chatId ? skipToken : undefined,
      {
        onData: handlePresenceUpdate,
        onError: handlePresenceError,
      }
    )
  );

  useSubscription(
    trpc.onlinePresence.onPresenceInChatChange.subscriptionOptions(
      chatId ? { chatId } : skipToken,
      {
        onData: handlePresenceUpdate,
        onError: handlePresenceError,
      }
    )
  );

  const numProfilesOnline = useMemo(
    () => data?.filter((p) => p.isOnline).length ?? 0,
    [data]
  );

  return {
    activeProfiles: data,
    numProfilesOnline,
    isLoading,
    error,
    subscriptionStatus: status,
    subscriptionError,
  };
}
