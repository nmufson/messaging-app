import { useTRPC } from '@/lib/trpc';
import { ObjectId } from '@repo/common';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';

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
  senderProfileId?: ObjectId;
  receiverProfileId?: ObjectId;
}

export function useChat(params: UseChatParams) {
  const { chatId, senderProfileId: profileId, receiverProfileId } = params;
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

  return { chat, isLoading, error, mutate, isPending, sendToChatError };
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
  searchString: string;
  selectedProfiles: ObjectId[];
}

export function usePotentialChats(params: PotentialChatsParams) {
  const trpc = useTRPC();
  const { searchString, selectedProfiles } = params;

  // TODO: implement debounce for search input
  const searchNames = searchString
    .split(' ')
    .filter((name) => name.trim() !== '');

  const {
    data: potentialChats,
    isLoading,
    error,
  } = useQuery(
    trpc.chat.getPotentialChats.queryOptions(
      searchNames.length > 0
        ? {
            names: searchNames,
            selectedProfiles,
          }
        : skipToken
    )
  );

  return {
    profiles: potentialChats?.profiles ?? [],
    groupChats: potentialChats?.groupChats ?? [],
    isLoading,
    error,
  };
}
