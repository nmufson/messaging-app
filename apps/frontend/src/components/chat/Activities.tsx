import { ActionBubble } from '@/app/chat/[slug]/ActionBubble';
import { MessageBubble } from '@/app/chat/[slug]/MessageBubble';
import { useAuth } from '@/context/AuthContext';
import { ChatActivityDTO, ObjectId } from '@repo/common';
import * as _ from 'lodash';
import { RefObject, useMemo } from 'react';

interface ActivitiesProps {
  activities: ChatActivityDTO[];
  messageToViewRef: RefObject<HTMLDivElement | null>;
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  messageToView?: ObjectId | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function Activities(props: ActivitiesProps) {
  const {
    activities,
    messageToViewRef,
    messagesContainerRef,
    messagesEndRef,
    messageToView,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = props;
  const { profile } = useAuth();

  const handleScroll = useMemo(
    () =>
      _.debounce((scrollTop: number) => {
        if (scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }, 300),
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  if (!activities || !activities.length) {
    return (
      <div className="flex flex-1 items-center justify-center py-4 text-gray-500">
        No messages yet
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
      className="messages-container flex-1 overflow-y-auto py-4 pb-6"
    >
      {activities.map((activity, i) => {
        if (activity.activityType === 'message') {
          const messageWithSender = {
            ...activity,
            sender: activity.sender,
          };

          const { shouldShowName, shouldShowAvatar } = (() => {
            const isCurrentUser = profile?.id === messageWithSender.sender.id;
            if (isCurrentUser) {
              return { shouldShowName: false, shouldShowAvatar: false };
            }

            let shouldShowName = true;
            let shouldShowAvatar = true;

            const prevActivity = activities[i - 1];
            const isPrevActivityMessage =
              prevActivity && prevActivity?.activityType === 'message';

            const nextActivity = activities[i + 1];
            const isNextActivityMessage =
              nextActivity && nextActivity?.activityType === 'message';

            shouldShowName =
              !isPrevActivityMessage ||
              prevActivity.senderId != activity.senderId;
            shouldShowAvatar =
              !isNextActivityMessage ||
              nextActivity.senderId != activity.senderId;

            return { shouldShowName, shouldShowAvatar };
          })();

          return (
            <MessageBubble
              key={activity.id}
              message={messageWithSender}
              showName={shouldShowName}
              showAvatar={shouldShowAvatar}
              ref={messageToView === activity.id ? messageToViewRef : null}
            />
          );
        }

        return <ActionBubble key={activity.id} action={activity} />;
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
