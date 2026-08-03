import { useTRPC } from '@/lib/trpc';
import { DurationObject, ObjectId, PresenceUpdate } from '@repo/common';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useMemo } from 'react';
import * as R from 'remeda';

interface OnlinePresenceOptions {
  chatId?: ObjectId;
  withinLast?: DurationObject;
  friendsOnly?: boolean;
}

export function useOnlinePresence(options?: OnlinePresenceOptions) {
  const { chatId } = options || {};
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryKey = trpc.onlinePresence.profilesPresence.queryKey(options);

  const { data, isLoading, error } = useQuery(
    trpc.onlinePresence.profilesPresence.queryOptions(options)
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
      // only run when not in specific chat
      chatId ? skipToken : {},
      {
        onData: handlePresenceUpdate,
        onError: handlePresenceError,
        enabled: !R.isTruthy(chatId),
      }
    )
  );

  useSubscription(
    trpc.onlinePresence.onPresenceInChatChange.subscriptionOptions(
      chatId ? { chatId } : skipToken,
      {
        onData: handlePresenceUpdate,
        onError: handlePresenceError,
        enabled: R.isTruthy(chatId),
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
