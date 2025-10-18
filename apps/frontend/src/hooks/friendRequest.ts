import { useTRPC } from '@/lib/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useFriendRequest = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    mutate: sendFriendRequest,
    isPending: isSending,
    error: sendError,
  } = useMutation(
    trpc.friendRequest.sendRequest.mutationOptions({
      onSuccess: (data, variables) => {
        const profileQueryKey = trpc.profile.byId.queryKey({
          profileId: variables.receiverId,
        });
        queryClient.setQueryData(profileQueryKey, (old) =>
          old ? { ...old, hasOutstandingFriendRequest: true } : old
        );
      },
    })
  );

  const {
    mutate: cancelFriendRequest,
    isPending: isUpdating,
    error: updateError,
  } = useMutation(
    trpc.friendRequest.update.mutationOptions({
      onSuccess: (data, variables) => {
        const profileQueryKey = trpc.profile.byId.queryKey({
          profileId: variables.receiverId,
        });
        queryClient.setQueryData(profileQueryKey, (old) =>
          old ? { ...old, hasOutstandingFriendRequest: false } : old
        );
      },
    })
  );

  return {
    sendFriendRequest,
    cancelFriendRequest,
    isLoading: isSending || isUpdating,
    sendError,
    updateError,
  };
};
