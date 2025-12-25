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
  content?: string | null;
  imageUrl?: string | null;
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

  const findChatQuery = useMemo(() => {
    if (chatId) {
      return { chatId };
    }
    if (profileIds && profileIds.length > 0) {
      return { profileIds };
    }
    return null;
  }, [chatId, profileIds]);

  const findChatQueryKey = trpc.chat.findChat.queryKey(findChatQuery ?? {});

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

  const {
    mutate: createChat,
    isPending: isCreateChatPending,
    error: createChatError,
  } = useMutation(
    trpc.action.createChat.mutationOptions({
      onSuccess: (newChat) => {
        queryClient.setQueryData(findChatQueryKey, newChat);
      },
    })
  );

  const sendMessage = (params: SendMessageParams) => {
    const { senderId, content, imageUrl, type, onSuccess } = params;
    // If chat exists, send message
    if (chatId) {
      console.log('sending message to existing chat', chatId);
      sendMessageToChat(
        {
          content: content || null,
          imageUrl: imageUrl || null,
          senderId,
          chatId,
          type,
        },
        {
          onSuccess: () => {
            onSuccess?.(chatId);
          },
        }
      );
    } else if (profileIds) {
      // If chat does not exist, create chat with first message
      const newChatProfileIds = [...profileIds, senderId];
      createChat(
        {
          creatorId: senderId,
          participantProfileIds: newChatProfileIds,
          type: newChatProfileIds.length > 2 ? 'GROUP' : 'DIRECT',
          firstMessage: {
            type,
            content: content || null,
            imageUrl: imageUrl || null,
          },
        },
        {
          onSuccess: (newChat) => {
            if (newChat?.id) {
              onSuccess?.(newChat.id);
            }
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
  };
}
