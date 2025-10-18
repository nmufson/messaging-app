import { useTRPC } from '@/lib/trpc';
import { ObjectId } from '@repo/common';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useEffect } from 'react';

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
  chatId: ObjectId;
  profileId?: ObjectId;
}

export function useChat({ chatId, profileId }: UseChatParams) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const chatQueryKey = trpc.chat.byId.queryKey({ chatId });
  const queryOptions = trpc.chat.byId.queryOptions(
    chatId ? { chatId } : skipToken
  );

  const { data: chat, isLoading, error } = useQuery(queryOptions);

  const {
    mutate,
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
  console.log(status);
  console.log(subscriptionError);
  return { chat, isLoading, error, mutate, isPending, sendToChatError };
}
