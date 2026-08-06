import { ActionBubble } from '@/app/chat/[slug]/ActionBubble';
import { MessageBubble } from '@/app/chat/[slug]/MessageBubble';
import { PROFILE_FALLBACK } from '@/constants';
import { ChatActivityDTO, ChatParticipantDTO, ObjectId } from '@repo/common';
import * as _ from 'lodash';
import { RefObject, useMemo } from 'react';

interface ActivitiesProps {
  activities: ChatActivityDTO[];
  participants: ChatParticipantDTO[];
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
    participants,
    messageToViewRef,
    messagesContainerRef,
    messagesEndRef,
    messageToView,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = props;

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
    return <div>No messages yet</div>;
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
      className="messages-container flex-1 overflow-y-auto py-4 pb-6"
    >
      {activities.map((activity, i) => {
        if (activity.activityType === 'message') {
          const sender = participants.find(
            (p) => p.profile.id === activity.senderId
          );

          if (!sender) {
            console.error('Sender not found in chat participants', {
              message: activity,
              senderId: activity.senderId,
            });
          }
          const messageWithSender = {
            ...activity,
            sender: sender?.profile ?? PROFILE_FALLBACK,
          };

          const { shouldShowName, shouldShowAvatar } = (() => {
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

        const actioner = participants.find(
          (p) => p.profile.id === activity.actorId
        );
        const target = participants.find(
          (p) => p.profile.id === activity.targetId
        );

        if (!actioner) {
          console.error('Actioner not found in chat participants', {
            action: activity,
            actorId: activity.actorId,
          });
        }

        const actionWithActor = {
          ...activity,
          actor: actioner?.profile ?? PROFILE_FALLBACK,
          target: target?.profile ?? null,
        };

        return <ActionBubble key={activity.id} action={actionWithActor} />;
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
