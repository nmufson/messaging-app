import { useTRPC } from '@/lib/trpc';
import { ObjectId } from '@repo/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { send } from 'process';

export const useFriendRequest = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    mutate: sendFriendRequest,
    isPending: isSending,
    error: sendError,
  } = useMutation(trpc.friendRequest.sendRequest.mutationOptions());

  const {
    mutate: updateFriendRequest,
    isPending: isUpdating,
    error: updateError,
  } = useMutation(
    trpc.friendRequest.update.mutationOptions({
      onSuccess: (data, variables) => {
        const profileQueryKey = trpc.profile.byId.queryKey({
          profileId: variables.receiverId,
        });
        queryClient.setQueryData(profileQueryKey, (old) =>
          old ? { ...old, hasSentFriendRequest: true } : old
        );
      },
    })
  );

  return {
    sendFriendRequest,
    updateFriendRequest,
  };
};
