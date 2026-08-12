import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/Toast/ToastContext';
import { useTRPC } from '@/lib/trpc';
import {
  ActionOutputDTO,
  checkIsActivityCreator,
  ObjectId,
} from '@repo/common';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useMemo } from 'react';

export function useChatList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const loggedInProfileId = profile?.id;

  const chatListQueryKey = trpc.chat.getList.queryKey({});

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery(trpc.chat.getList.queryOptions({}));

  useSubscription(
    trpc.activity.onNewActivityInChatList.subscriptionOptions(
      loggedInProfileId ? { profileId: loggedInProfileId } : skipToken,
      {
        onData(newActivityData) {
          const newActivity = newActivityData.data;

          queryClient.setQueryData(chatListQueryKey, (oldData) => {
            if (!oldData) return oldData;

            const activityChatId = newActivity.chatId;

            return oldData.map((chat) => {
              if (chat.id === activityChatId) {
                const updatedParticipants = chat.participants.map(
                  (participant) => {
                    const isActivityCreator = checkIsActivityCreator(
                      participant.profile.id,
                      newActivity
                    );

                    if (isActivityCreator) {
                      // don't increment unread count for activity creator
                      return participant;
                    }
                    return {
                      ...participant,
                      unreadActivities: participant.unreadActivities + 1,
                    };
                  }
                );
                return {
                  ...chat,
                  activities: [...chat.activities, newActivity],
                  participants: updatedParticipants,
                };
              }
              return chat;
            });
          });
        },
      }
    )
  );

  useSubscription(
    trpc.chat.onNewChat.subscriptionOptions(undefined, {
      onData(newChatData) {
        const newChat = newChatData.data;

        queryClient.setQueryData(chatListQueryKey, (oldData) => {
          if (!oldData) return oldData;

          return [newChat, ...oldData];
        });
      },
    })
  );

  return { chats, isLoading, error };
}

interface UseChatParams {
  chatId: ObjectId | null;
  profileIds?: ObjectId[];
}

export function useChat(params: UseChatParams) {
  const { profileIds } = params;
  let { chatId } = params;

  const trpc = useTRPC();

  const findChatQuery = useMemo(() => {
    if (chatId) {
      return { chatId };
    }
    if (profileIds && profileIds.length > 0) {
      return { profileIds };
    }
    return null;
  }, [chatId, profileIds]);

  const findChatQueryOptions = trpc.chat.findChat.queryOptions(
    findChatQuery ?? skipToken
  );

  const { data: chat, isLoading, error } = useQuery(findChatQueryOptions);

  return {
    chat,
    isLoading,
    error,
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

  const activitiesQueryInput = {
    chatId,
    options: {
      sortDirection: 'asc' as const,
    },
  };

  const chatInfoQueryKey = trpc.chat.getInfo.queryKey({
    chatId,
  });
  const findChatQueryKey = trpc.chat.findChat.queryKey({ chatId });
  const activitiesQueryKey =
    trpc.activity.getActivities.infiniteQueryKey(activitiesQueryInput);

  const { data: chat, isLoading } = useQuery(
    trpc.chat.getInfo.queryOptions({ chatId })
  );

  const { mutateAsync: updateChat, isPending: isUpdatingChatInfo } =
    useMutation(
      trpc.action.updateInfo.mutationOptions({
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
    queryClient.setQueryData(findChatQueryKey, updatedChat);

    queryClient.setQueryData(activitiesQueryKey, (oldData) => {
      console.log(oldData, 'old data');
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
    trpc.action.addMember.mutationOptions({
      onSuccess: (addMemberOutput: ActionOutputDTO) => {
        handleSuccess(addMemberOutput);
      },
    })
  );
  const { mutate: removeMember, isPending: isRemovingMember } = useMutation(
    trpc.action.removeMember.mutationOptions({
      onSuccess: (removeMemberOutput: ActionOutputDTO) => {
        handleSuccess(removeMemberOutput);
      },
    })
  );
  const { mutate: leaveChat, isPending: isLeavingChat } = useMutation(
    trpc.action.leaveChat.mutationOptions({})
  );

  return {
    chat,
    isLoading,
    updateChat,
    isUpdatingChatInfo,
    addMember,
    removeMember,
    leaveChat,
    isAddingMember,
    isRemovingMember,
    isLeavingChat,
  };
}
