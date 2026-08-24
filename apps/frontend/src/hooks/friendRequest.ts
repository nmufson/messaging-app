import { useToast } from '@/context/Toast/ToastContext';
import { useTRPC } from '@/lib/trpc';
import { FriendRequestStatus, RelationshipToViewer } from '@repo/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UseFriendRequestParams {
  requestStatuses?: FriendRequestStatus[];
  listQueryEnabled?: boolean;
}

export const useFriendRequest = (params: UseFriendRequestParams = {}) => {
  const { requestStatuses = ['PENDING', 'ACCEPTED', 'DECLINED'] } = params;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const requestListQueryKey = trpc.friendRequest.list.queryKey({
    statuses: requestStatuses,
  });
  const requestListQueryOptions = trpc.friendRequest.list.queryOptions({
    statuses: requestStatuses,
  });

  const { data: requests } = useQuery({
    ...requestListQueryOptions,
  });

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
    mutate: updateIncomingFriendRequest,
    isPending: isUpdating,
    error: updateError,
  } = useMutation(
    trpc.friendRequest.respondToIncoming.mutationOptions({
      onSuccess: (data, variables) => {
        // Update cache for sender's profile to reflect change on their profile view
        const senderProfileQueryKey = trpc.profile.byId.queryKey({
          profileId: variables.senderId,
        });

        const nextRelationship: RelationshipToViewer =
          data.status === FriendRequestStatus.enum.ACCEPTED ? 'FRIEND' : 'NONE';

        queryClient.setQueryData(senderProfileQueryKey, (old) =>
          old
            ? {
                ...old,
                relationshipToViewer: nextRelationship,
              }
            : old
        );

        queryClient.invalidateQueries({ queryKey: requestListQueryKey });

        if (variables.newStatus === FriendRequestStatus.enum.ACCEPTED) {
          addToast({
            header: 'Friend Request Accepted',
            body: 'Friend request accepted successfully.',
            variant: 'success',
          });
        } else {
          addToast({
            header: 'Friend Request Declined',
            body: 'Friend request declined successfully.',
            variant: 'info',
          });
        }
      },
      onError: (error) => {
        addToast({
          header: 'Unable to Respond to Request',
          body:
            error.message ||
            'Something went wrong while responding to this request.',
          variant: 'danger',
        });
      },
    })
  );

  const {
    mutate: cancelOutgoingFriendRequest,
    isPending: isCancelling,
    error: cancelError,
  } = useMutation(
    trpc.friendRequest.cancelOutgoing.mutationOptions({
      onSuccess: (_data, variables) => {
        const receiverProfileQueryKey = trpc.profile.byId.queryKey({
          profileId: variables.receiverId,
        });

        queryClient.setQueryData(receiverProfileQueryKey, (old) =>
          old
            ? {
                ...old,
                relationshipToViewer: 'NONE' as const,
              }
            : old
        );

        queryClient.invalidateQueries({ queryKey: requestListQueryKey });

        addToast({
          header: 'Friend Request Cancelled',
          body: 'Friend request cancelled successfully.',
          variant: 'info',
        });
      },
      onError: (error) => {
        addToast({
          header: 'Unable to Cancel Request',
          body:
            error.message ||
            'Something went wrong while cancelling this request.',
          variant: 'danger',
        });
      },
    })
  );

  return {
    sendFriendRequest,
    updateIncomingFriendRequest,
    cancelOutgoingFriendRequest,
    requests: requests ?? [],
    numRequests,
    isLoading: isSending || isUpdating || isCancelling,
    sendError,
    updateError,
    cancelError,
  };
};
