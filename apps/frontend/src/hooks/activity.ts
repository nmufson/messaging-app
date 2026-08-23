import { useTRPC } from '@/lib/trpc';
import { ObjectId, SortDirection } from '@repo/common';
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useMemo } from 'react';

interface SendMessageParams {
  senderId: ObjectId;
  type: 'TEXT' | 'IMAGE';
  content: string | null;
  imageUrl: string | null;
  onSuccess?: (chatId: ObjectId) => void;
}

export function useChatActivities(
  chatId?: ObjectId,
  profileIds?: ObjectId[],
  options?: { sortDirection?: SortDirection }
) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { sortDirection = 'asc' } = options || {};
  const chatListQueryKey = trpc.chat.list.queryKey({});

  const activitiesQuery = useMemo(() => {
    if (chatId) {
      return {
        chatId,
        options: {
          sortDirection,
        },
      };
    }
    return {};
  }, [chatId, sortDirection]);

  const activitiesQueryKey =
    trpc.activity.getActivities.infiniteQueryKey(activitiesQuery);

  const {
    data: activityData,
    isLoading: isActivitiesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.activity.getActivities.infiniteQueryOptions(
      chatId
        ? {
            chatId,
            options: {
              sortDirection,
            },
          }
        : skipToken,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        // enabled: !!chat,
      }
    )
  );

  const {
    mutate: sendMessageToChat,
    isPending,
    error: sendToChatError,
  } = useMutation(
    trpc.message.sendToChat.mutationOptions({
      onSuccess: (messageActivity) => {
        queryClient.setQueryData(activitiesQueryKey, (oldData) => {
          console.log(messageActivity);
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];

          const firstPage = newPages[0];
          if (!firstPage) return oldData;

          newPages[0] = {
            ...firstPage,
            activities: [...firstPage.activities, messageActivity],
          };

          return { ...oldData, pages: newPages };
        });

        queryClient.invalidateQueries({ queryKey: chatListQueryKey });
      },
    })
  );

  const {
    mutate: sendMessageToNewChat,
    isPending: isSendingToNewChat,
    error: sendToNewChatError,
  } = useMutation(
    trpc.message.sendToNewChat.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: chatListQueryKey });
      },
    })
  );

  const allActivities = useMemo(() => {
    return (
      activityData?.pages
        .slice()
        .reverse()
        .flatMap((page) => page.activities) ?? []
    );
  }, [activityData]);

  const onNewActivityQuery = useMemo(() => {
    if (!chatId) {
      return skipToken;
    }

    const latestActivity = allActivities[allActivities.length - 1];
    return {
      chatId,
      ...(latestActivity && {
        cursor: {
          lastActivityTime: latestActivity.createdAt,
          lastActivityId: latestActivity.id,
        },
      }),
    };
  }, [chatId, allActivities]);

  const { status, error: subscriptionError } = useSubscription(
    trpc.activity.onNewActivity.subscriptionOptions(onNewActivityQuery, {
      onData(newActivityData) {
        const newActivity = newActivityData.data;

        queryClient.setQueryData(activitiesQueryKey, (oldData) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          const firstPage = newPages[0];
          if (!firstPage) return oldData;

          newPages[0] = {
            ...firstPage,
            activities: [...firstPage.activities, newActivity],
          };

          return {
            ...oldData,
            pages: newPages,
          };
        });
      },
    })
  );

  const sendMessage = (params: SendMessageParams) => {
    const { onSuccess, ...message } = params;
    // If chat exists, send message
    if (chatId) {
      console.log('sending message to existing chat', chatId);
      sendMessageToChat(
        {
          message,
          chatId,
        },
        {
          onSuccess: () => {
            onSuccess?.(chatId);
          },
        }
      );
    } else if (profileIds) {
      sendMessageToNewChat(
        {
          message,
          participantProfileIds: profileIds,
        },
        {
          onSuccess: (messageActivity) => {
            onSuccess?.(messageActivity.chatId);
          },
        }
      );
    } else {
      console.error('Chat or selected profiles required to send message');
    }
  };

  return {
    sendMessage,
    allActivities,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isActivitiesLoading,
    isSendingMessage: isPending || isSendingToNewChat,
    sendMessageError: sendToChatError ?? sendToNewChatError,
  };
}
