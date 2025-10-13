import { useTRPC } from '@/lib/trpc';
import { ObjectId } from '@repo/common';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export function useChatList() {
  const trpc = useTRPC();

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery(trpc.chat.getList.queryOptions({}));

  return { chats, isLoading, error };
}

export function useChat(chatId: ObjectId) {
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

  return { chat, isLoading, error, mutate, isPending, sendToChatError };
}
