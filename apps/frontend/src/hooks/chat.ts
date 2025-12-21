import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/Toast/ToastContext';
import { useTRPC } from '@/lib/trpc';
import {
  ActionOutputDTO,
  DateRange,
  ObjectId,
  tagActivity,
} from '@repo/common';
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useMemo } from 'react';

export function useChatList() {
  const trpc = useTRPC();

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery(trpc.chat.getList.queryOptions({}));

  return { chats, isLoading, error };
}

interface SendMessageParams {
  senderId: ObjectId;
  type: 'TEXT' | 'IMAGE';
  content?: string | null;
  imageUrl?: string | null;
  onSuccess?: (chatId: ObjectId) => void;
}

interface UseChatParams {
  chatId: ObjectId | null;
  profileIds?: ObjectId[];
  senderProfileId?: ObjectId;
}

export function useChat(params: UseChatParams) {
  const { profileIds, senderProfileId: profileId } = params;
  let { chatId } = params;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryInput = useMemo(() => {
    if (chatId) {
      return { chatId };
    }
    if (profileIds && profileIds.length > 0) {
      return { profileIds };
    }
    return null;
  }, [chatId, profileIds]);

  const chatQueryKey = trpc.chat.findChat.queryKey(queryInput ?? {});

  const queryOptions = trpc.chat.findChat.queryOptions(queryInput ?? skipToken);

  const { data: chat, isLoading, error } = useQuery(queryOptions);

  if (!chatId && chat?.id) {
    chatId = chat.id;
  }

  const activitiesQueryKey = trpc.chat.getActivities.infiniteQueryKey(
    chatId ? { chatId } : {}
  );

  const {
    data: activityData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.chat.getActivities.infiniteQueryOptions(
      chatId
        ? {
            chatId,
            options: {
              sortDirection: 'asc',
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

  const {
    mutate: createChat,
    isPending: isCreateChatPending,
    error: createChatError,
  } = useMutation(
    trpc.chat.create.mutationOptions({
      onSuccess: (newChat) => {
        queryClient.setQueryData(chatQueryKey, newChat);
      },
    })
  );

  const { status, error: subscriptionError } = useSubscription(
    trpc.chat.onNewMessageInChat.subscriptionOptions(
      profileId ? { profileId } : skipToken,
      {
        onData(newMessageActivityData) {
          // TODO: re-examine this
          const newMessageActivity = newMessageActivityData.data
            ? newMessageActivityData.data
            : newMessageActivityData;
          if (!chat) return;
          queryClient.setQueryData(activitiesQueryKey, (oldData) => {
            if (!oldData) return oldData;
            const newPages = [...oldData.pages];
            const firstPage = newPages[0];
            if (!firstPage) return oldData;

            newPages[0] = {
              ...firstPage,
              activities: [...firstPage.activities, ...newMessageActivity],
            };

            return {
              ...oldData,
              pages: newPages,
            };
          });
        },
      }
    )
  );

  const sendMessage = (params: SendMessageParams) => {
    const { senderId, content, imageUrl, type, onSuccess } = params;
    // If chat exists, send message
    if (chat && chat.id) {
      sendMessageToChat(
        {
          content: content || null,
          imageUrl: imageUrl || null,
          sender: senderId,
          chatId: chat.id,
          type,
        },
        { onSuccess: () => onSuccess?.(chat.id) }
      );
    } else if (profileIds) {
      // If chat does not exist, create chat with first message
      const newChatProfileIds = [...profileIds, senderId];
      createChat(
        {
          creator: senderId,
          participants: newChatProfileIds,
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
    chat,
    activityData,
    isLoading,
    error,
    sendMessageToChat,
    createChat,
    isPending,
    sendToChatError,
    sendMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

interface PotentialChatsParams {
  searchInput: string;
  requireInput?: boolean;
  selectedProfiles?: ObjectId[];
}

export function usePotentialChats(params: PotentialChatsParams) {
  const trpc = useTRPC();
  const { searchInput, requireInput, selectedProfiles } = params;

  // TODO: implement debounce for search input
  const searchNames = searchInput
    .split(' ')
    .filter((name) => name.trim() !== '');

  const {
    data: potentialChats,
    isLoading,
    error,
  } = useQuery(
    trpc.chat.getPotentialChats.queryOptions({
      searchNames,
      requireInput,
      selectedProfiles,
    })
  );

  return {
    profiles: potentialChats?.profiles ?? [],
    groupChats: potentialChats?.groupChats ?? [],
    isLoading,
    error,
  };
}

interface ChatInfoParams {
  chatId: ObjectId;
}

export function useChatInfo(params: ChatInfoParams) {
  const { chatId } = params;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const chatInfoQueryKey = trpc.chat.getInfo.queryKey({
    chatId,
  });
  const activitiesQueryKey = trpc.chat.getActivities.infiniteQueryKey({
    chatId,
  });

  const { data: chat, isLoading } = useQuery(
    trpc.chat.getInfo.queryOptions({ chatId })
  );

  const { mutateAsync: updateChat, isPending } = useMutation(
    trpc.chat.updateInfo.mutationOptions({
      onSuccess: (data) => {
        const { updatedChat, newActionActivity } = data;

        // Update the info query cache and findChat query from ChatContent
        queryClient.setQueryData(chatInfoQueryKey, updatedChat);

        queryClient.setQueryData(activitiesQueryKey, (oldData) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          const firstPage = newPages[0];
          if (!firstPage) return oldData;

          console.log(newActionActivity, 'new action activity');

          newPages[0] = {
            ...firstPage,
            activities: [...firstPage.activities, newActionActivity],
          };
          return { ...oldData, pages: newPages };
        });

        addToast({
          header: 'Success',
          body: 'Chat updated successfully!',
          variant: 'success',
        });
      },
      onError: (error) => {
        addToast({
          header: 'Error',
          body:
            error.message || 'Failed to update chat, please try again later.',
          variant: 'danger',
        });
      },
    })
  );

  const handleSuccess = (data: ActionOutputDTO) => {
    const { updatedChat, newActionActivity } = data;

    queryClient.setQueryData(chatInfoQueryKey, updatedChat);

    queryClient.setQueryData(activitiesQueryKey, (oldData) => {
      if (!oldData) return oldData;

      const newPages = [...oldData.pages];
      const firstPage = newPages[0];
      if (!firstPage) return oldData;

      newPages[0] = {
        ...firstPage,
        activities: [...firstPage.activities, newActionActivity],
      };
      return { ...oldData, pages: newPages };
    });
  };

  const { mutate: addMember, isPending: isAddingMember } = useMutation(
    trpc.chat.addMember.mutationOptions({
      onSuccess: (updatedChat) => {
        handleSuccess(updatedChat);
      },
    })
  );
  const { mutate: removeMember, isPending: isRemovingMember } = useMutation(
    trpc.chat.removeMember.mutationOptions({
      onSuccess: (updatedChat) => {
        handleSuccess(updatedChat);
      },
    })
  );
  const { mutate: leaveChat, isPending: isLeavingChat } = useMutation(
    trpc.chat.leaveChat.mutationOptions({
      onSuccess: (updatedChat) => {
        handleSuccess(updatedChat);
      },
    })
  );

  return {
    chat,
    isLoading,
    updateChat,
    isPending,
    addMember,
    removeMember,
    leaveChat,
    isAddingMember,
    isRemovingMember,
    isLeavingChat,
  };
}
