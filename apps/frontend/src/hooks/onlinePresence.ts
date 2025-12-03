import { useTRPC } from '@/lib/trpc';
import { DurationObject, ObjectId, PresenceUpdate } from '@repo/common';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useMemo } from 'react';

interface OnlinePresenceOptions {
  chatId?: ObjectId;
  withinLast?: DurationObject;
}

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

  const onlineProfiles = useMemo(
    () => data?.filter((p) => p.isOnline) || [],
    [data]
  );

  return {
    activeProfiles: data ?? [], // those online or recently online
    onlineProfiles,
    numProfilesOnline: onlineProfiles.length,
    isLoading,
    error,
    subscriptionStatus: status,
    subscriptionError,
  };
}
