import { useTRPC } from '@/lib/trpc';
import { skipToken, useQuery } from '@tanstack/react-query';
import { ObjectId } from '@repo/common';

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
