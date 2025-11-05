import { useTRPC } from '@/lib/trpc';
import { ObjectId } from '@repo/common';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { Send } from 'express-serve-static-core';
import { send } from 'process';
import { use, useMemo } from 'react';

export function useChatList() {
  const trpc = useTRPC();

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery(trpc.chat.getList.queryOptions({}));

  return { chats, isLoading, error };
}

interface UseChatParams {
  chatId: ObjectId | null;
  profileIds?: ObjectId[];
  senderProfileId?: ObjectId;
}

interface SendMessageParams {
  senderId: ObjectId;
  type: 'TEXT' | 'IMAGE';
  content?: string | null;
  imageUrl?: string | null;
  onSuccess?: (chatId: ObjectId) => void;
}

export function useChat(params: UseChatParams) {
  const { chatId, profileIds, senderProfileId: profileId } = params;
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
  const chatQueryFilter = trpc.chat.findChat.queryFilter(queryInput ?? {});

  const queryOptions = trpc.chat.findChat.queryOptions(queryInput ?? skipToken);

  const { data: chat, isLoading, error } = useQuery(queryOptions);

  const {
    mutate: sendMessageToChat,
    isPending,
    error: sendToChatError,
  } = useMutation(
    trpc.message.sendToChat.mutationOptions({
      onSuccess: (newMessage) => {
        queryClient.setQueryData(chatQueryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: [...oldData.messages, newMessage],
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
    trpc.chat.createChat.mutationOptions({
      onSuccess: (newChat) => {
        queryClient.setQueryData(chatQueryKey, newChat);
      },
    })
  );

  const { status, error: subscriptionError } = useSubscription(
    trpc.chat.onNewMessageInChat.subscriptionOptions(
      profileId ? { profileId } : skipToken,
      {
        onData(newMessage) {
          const messageData = newMessage.data ? newMessage.data : newMessage;
          queryClient.setQueryData(chatQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              messages: [...oldData.messages, messageData],
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
    isLoading,
    error,
    sendMessageToChat,
    createChat,
    isPending,
    sendToChatError,
    sendMessage,
  };
}

interface useDirectMessageParams {
  senderId: ObjectId;
  receiverId: ObjectId;
}

export function useDirectMessage({
  senderId,
  receiverId,
}: useDirectMessageParams) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
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

interface FindChatParams {
  chatId?: ObjectId;
  profileIds?: ObjectId[];
}
export function useFindChat(params: FindChatParams) {
  const { chatId, profileIds } = params;
  const trpc = useTRPC();

  const {
    data: chat,
    isLoading,
    error,
  } = useQuery(
    trpc.chat.findChat.queryOptions(
      chatId
        ? { chatId }
        : profileIds && profileIds.length > 0
          ? { profileIds }
          : skipToken
    )
  );

  return { chat, isLoading, error };
}
