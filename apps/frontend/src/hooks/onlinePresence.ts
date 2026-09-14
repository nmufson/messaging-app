import { useTRPC } from '@/lib/trpc';
import { BaseProfileDTO, DurationObject, ObjectId } from '@repo/common';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import * as R from 'remeda';

interface OnlinePresenceOptions {
  chatId?: ObjectId;
  withinLast?: DurationObject;
  friendsOnly?: boolean;
}

export function useOnlinePresence(options?: OnlinePresenceOptions) {
  const { chatId, withinLast = { hours: 1 } } = options || {};
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryKey = trpc.onlinePresence.profilesPresence.queryKey(options);
  const presenceQueryOptions =
    trpc.onlinePresence.profilesPresence.queryOptions(options, {
      staleTime: 0,
      refetchOnMount: true,
    });

  const { data, isLoading, error } = useQuery(presenceQueryOptions);

  const shouldIncludeProfile = (profile: BaseProfileDTO) => {
    if (profile.isOnline) return true;
    if (!profile.lastOnline) return false;

    const cutoff = DateTime.now().minus(withinLast);
    return profile.lastOnline.toMillis() >= cutoff.toMillis();
  };

  const handlePresenceUpdate = (presenceUpdate: BaseProfileDTO) => {
    queryClient.setQueryData(
      queryKey,
      (oldData: BaseProfileDTO[] | undefined) => {
        if (!oldData) return oldData;

        const existingProfileIndex = oldData.findIndex(
          (profile) => profile.id === presenceUpdate.id
        );
        const shouldInclude = shouldIncludeProfile(presenceUpdate);

        if (existingProfileIndex === -1) {
          if (!shouldInclude) return oldData;
          return [...oldData, presenceUpdate];
        }

        if (!shouldInclude) {
          return oldData.filter((profile) => profile.id !== presenceUpdate.id);
        }

        return oldData.map((profile) => {
          if (profile.id !== presenceUpdate.id) {
            return profile;
          }

          return {
            ...profile,
            ...presenceUpdate,
          };
        });
      }
    );
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
