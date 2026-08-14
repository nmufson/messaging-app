import { useTRPC } from '@/lib/trpc';
import { FriendRequestStatus, RelationshipToViewer } from '@repo/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useFriendRequest = (requestStatuses?: FriendRequestStatus[]) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const requestListQueryKey = trpc.friendRequest.getRequests.queryKey();

  const { data: requests } = useQuery(
    trpc.friendRequest.getRequests.queryOptions({ statuses: requestStatuses })
  );

  const numRequests = requests?.length ?? 0;
  const {
    mutate: sendFriendRequest,
    isPending: isSending,
    error: sendError,
  } = useMutation(
    trpc.friendRequest.sendRequest.mutationOptions({
      onSuccess: (data, variables) => {
        // Update cache for receiver's profile to reflect change on their profile view
        const receiverProfileQueryKey = trpc.profile.byId.queryKey({
          profileId: variables.receiverId,
        });
        queryClient.setQueryData(receiverProfileQueryKey, (old) =>
          old
            ? {
                ...old,
                relationshipToViewer: 'PENDING_OUTGOING_REQUEST' as const,
              }
            : old
        );
      },
    })
  );

  const {
    mutate: updateFriendRequest,
    isPending: isUpdating,
    error: updateError,
  } = useMutation(
    trpc.friendRequest.update.mutationOptions({
      onSuccess: (data, variables) => {
        // Update cache for sender's profile to reflect change on their profile view
        const senderProfileQueryKey = trpc.profile.byId.queryKey({
          profileId: variables.senderId,
        });

        const nextRelationship: RelationshipToViewer =
          variables.newStatus === 'ACCEPTED' ? 'FRIEND' : 'NONE';

        queryClient.setQueryData(senderProfileQueryKey, (old) =>
          old
            ? {
                ...old,
                relationshipToViewer: nextRelationship,
              }
            : old
        );

        queryClient.invalidateQueries({ queryKey: requestListQueryKey });
      },
    })
  );

  return {
    sendFriendRequest,
    updateFriendRequest,
    requests,
    numRequests,
    isLoading: isSending || isUpdating,
    sendError,
    updateError,
  };
};
