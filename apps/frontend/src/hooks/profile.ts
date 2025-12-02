import { useTRPC } from '@/lib/trpc';
import { ObjectId } from '@repo/common';
import { skipToken, useQuery } from '@tanstack/react-query';

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
