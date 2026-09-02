import { useTRPC } from '@/lib/trpc';
import { ObjectId, SortDirection } from '@repo/common';
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useEffect, useMemo } from 'react';

interface SendMessageParams {
  senderId: ObjectId;
  type: 'TEXT' | 'IMAGE';
  content: string | null;
  imageUrl: string | null;
  chatId?: ObjectId;
  participantProfileIds?: ObjectId[];
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
    trpc.activity.list.infiniteQueryKey(activitiesQuery);

  const findChatQueryKey = chatId
    ? trpc.chat.findChat.queryKey({ chatId })
    : null;

  const chatInfoQueryKey = chatId ? trpc.chat.info.queryKey({ chatId }) : null;

  const {
    data: activityData,
    isLoading: isActivitiesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.activity.list.infiniteQueryOptions(
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
    mutateAsync: sendMessageToChatAsync,
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
    mutateAsync: sendMessageToNewChatAsync,
    isPending: isSendingToNewChat,
    error: sendToNewChatError,
  } = useMutation(
    trpc.message.sendToNewChat.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: chatListQueryKey });
      },
    })
  );

  const { mutate: markChatAsRead } = useMutation(
    trpc.chat.markRead.mutationOptions({
      onSuccess: async () => {
        if (!chatId) {
          return;
        }

        await queryClient.invalidateQueries({ queryKey: chatListQueryKey });

        if (findChatQueryKey) {
          await queryClient.invalidateQueries({ queryKey: findChatQueryKey });
        }

        if (chatInfoQueryKey) {
          await queryClient.invalidateQueries({ queryKey: chatInfoQueryKey });
        }
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

  useEffect(() => {
    if (!chatId || !activityData) {
      return;
    }

    markChatAsRead({ chatId });
  }, [activityData, chatId, markChatAsRead]);

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

  useSubscription(
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

  const sendMessage = async (params: SendMessageParams) => {
    const { chatId: targetChatId, participantProfileIds, ...message } = params;
    const resolvedChatId = targetChatId ?? chatId;
    const resolvedParticipantProfileIds = participantProfileIds ?? profileIds;

    // If chat exists, send message
    if (resolvedChatId) {
      console.log('sending message to existing chat', resolvedChatId);
      const messageActivity = await sendMessageToChatAsync({
        message,
        chatId: resolvedChatId,
      });

      return messageActivity.chatId;
    }

    if (resolvedParticipantProfileIds) {
      const messageActivity = await sendMessageToNewChatAsync({
        message,
        participantProfileIds: resolvedParticipantProfileIds,
      });

      return messageActivity.chatId;
    }

    console.error('Chat or selected profiles required to send message');
    return null;
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
