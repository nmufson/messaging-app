import { ActionBubble } from '@/app/chat/[slug]/ActionBubble';
import { MessageBubble } from '@/app/chat/[slug]/MessageBubble';
import { SelectedProfile } from '@/app/chats/WriteToChatModal';
import { ProfileContent } from '@/app/profile/profileContent';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useChat } from '@/hooks/chat';
import { useInput } from '@/hooks/general';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { getChatDisplayName } from '@/utils';
import { useNavigation } from '@/utils/Navigation';
import { ActivityProfileDTO, ChatActivityDTO, ObjectId } from '@repo/common';
import * as _ from 'lodash';
import Link from 'next/link';
import { FormEvent, RefObject, useEffect, useMemo, useRef } from 'react';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import * as R from 'remeda';
import { GroupPhoto } from '../GroupPhoto';
import { FullscreenModal } from '../modal/FullscreenModal';
import { ProfileAvatar } from '../ProfileAvatar';
import { GroupChatInfo } from './GroupChatInfo';

const PROFILE_FALLBACK = {
  id: '',
  firstName: 'Unknown',
  lastName: '',
  avatarUrl: null,
};

interface ChatContentProps {
  chatId: ObjectId | null;
  messageToView?: ObjectId | null;
  profiles?: SelectedProfile[];
  inModalView?: boolean;
}

export function ChatContent(props: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageToViewRef = useRef<HTMLDivElement>(null);
  const { navigateToChat } = useNavigation();
  const { launchModal } = useModalContext();

  const { chatId, messageToView, profiles, inModalView } = props;
  const { profile } = useAuth();
  const loggedInProfileId = profile?.id;
  const {
    value: textInput,
    setValue: setTextInput,
    onChange: onTextInputChange,
  } = useInput();
  const { value: imageUrlInput, setValue: setImageUrlInput } = useInput();

  const {
    activeProfiles: activeParticipants,
    numProfilesOnline: numParticipantsOnline,
  } = useOnlinePresence({
    chatId: chatId ?? undefined,
  });
  const isAnyOnline = R.isTruthy(numParticipantsOnline);

  const onlineParticipants = useMemo(
    () => activeParticipants?.filter((p) => p.isOnline) || [],
    [activeParticipants]
  );
  const profileIds = profiles?.map((profile) => profile.id);

  const params = useMemo(() => {
    return {
      chatId,
      profileIds,
      senderProfileId: loggedInProfileId,
    };
  }, [chatId, loggedInProfileId, profileIds]);

  const {
    chat,
    isLoading,
    sendMessage,
    infiniteActivities,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChat(params);

  const allActivities = useMemo(() => {
    const historyActivities =
      infiniteActivities?.pages
        .slice()
        .reverse()
        .flatMap((page) => page.activities) ?? [];
    return [...historyActivities, ...(chat?.activities ?? [])];
  }, [infiniteActivities, chat]);

  const allProfiles = useMemo(() => {
    const historyProfiles =
      infiniteActivities?.pages.flatMap((page) => page.activityProfiles) ?? [];
    return R.uniqueBy(
      [...historyProfiles, ...(chat?.activityProfiles ?? [])],
      (p) => p.id
    );
  }, [infiniteActivities, chat]);

  useEffect(() => {
    if (messageToView && messageToViewRef.current) {
      messageToViewRef.current.scrollIntoView({ behavior: 'instant' });
      return;
    }
    // Only scroll to bottom on initial load
    if (
      !isLoading &&
      messagesEndRef.current &&
      !infiniteActivities?.pages.length
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, [messagesEndRef, isLoading, messageToView, infiniteActivities]);

  const handleSubmitMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) {
      console.error('Profile required to send message');
      return;
    }
    sendMessage({
      senderId: profile.id,
      type: textInput ? 'TEXT' : 'IMAGE',
      content: textInput || null,
      imageUrl: imageUrlInput || null,
      onSuccess: (chatId) => {
        if (inModalView) {
          navigateToChat(chatId);
        }
      },
    });

    setTextInput('');
    setImageUrlInput('');
    console.log('Message sent successfully!');
  };

  if (isLoading) return <Spinner />;
  if (!chat) return <div>Chat not found.</div>;

  const { participants, name, type } = chat;

  const displayName = getChatDisplayName({
    name,
    participants: participants || profiles,
    profileId: loggedInProfileId,
  });

  const otherProfile =
    type === 'DIRECT'
      ? participants.find((p) => p.id !== loggedInProfileId)
      : null;

  const handleInfoClick = () => {
    if (type === 'GROUP') {
      launchModal(
        <FullscreenModal title="Group Info">
          <GroupChatInfo chatId={chat.id} />
        </FullscreenModal>
      );
    } else if (type === 'DIRECT' && otherProfile) {
      launchModal(
        <FullscreenModal title="Chat">
          <ProfileContent profileId={otherProfile.id} />
        </FullscreenModal>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="header-container pt-2 pb-0 px-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
        <Link href="/chats" className="no-underline text-inherit">
          <i className="bi bi-caret-left-fill text-3xl" />
        </Link>
        {/* TODO: make this component */}
        <div className="flex flex-col items-center">
          {type === 'GROUP' ? (
            <GroupPhoto
              groupPictureUrl={chat?.groupPictureUrl || null}
              participants={participants}
            />
          ) : (
            otherProfile && (
              <ProfileAvatar
                firstName={otherProfile.firstName}
                lastName={otherProfile.lastName}
                avatarUrl={otherProfile.avatarUrl}
              />
            )
          )}
          <h1 className="text-xl font-semibold">{displayName}</h1>
          {isAnyOnline && (
            <OverlayTrigger
              placement="bottom"
              overlay={(props) => (
                <Tooltip id="online-participants-tooltip" {...props}>
                  {onlineParticipants.slice(0, 5).map((p) => (
                    <div key={p.id}>
                      {p.id === loggedInProfileId
                        ? 'You'
                        : `${p.firstName} ${p.lastName}`}
                    </div>
                  ))}
                  {onlineParticipants.length > 5 && (
                    <div>+ {onlineParticipants.length - 5} more...</div>
                  )}
                </Tooltip>
              )}
            >
              <div
                className="flex items-center -mt-2 cursor-pointer"
                tabIndex={0}
              >
                <i className="bi bi-dot text-4xl text-green-900"></i>
                <span>{type === 'GROUP' && numParticipantsOnline} Online</span>
              </div>
            </OverlayTrigger>
          )}
        </div>
        {/* have this button go to user profile if its direct chat, if group go to group info */}
        <i className="bi bi-info-circle text-2xl" onClick={handleInfoClick} />
      </div>
      <Activities
        activities={allActivities}
        profiles={allProfiles}
        messageToViewRef={messageToViewRef}
        messagesEndRef={messagesEndRef}
        messageToView={messageToView}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />

      <form
        onSubmit={handleSubmitMessage}
        className="send-message-form flex gap-3 justify-between items-center p-2 flex-shrink-0 bg-white border-t"
      >
        <div>
          <i className="bi bi-image text-3xl" />
        </div>
        <input
          type="text"
          name="message"
          autoComplete="off"
          placeholder="Type a message…"
          className="w-7/10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 "
          aria-label="Message input"
          value={textInput}
          onChange={onTextInputChange}
          required
        />
        <button type="submit" disabled={textInput.trim() === ''}>
          <i className="bi bi-arrow-up" />
        </button>
      </form>
    </div>
  );
}

interface ActivitiesProps {
  activities: ChatActivityDTO[];
  profiles: ActivityProfileDTO[];
  messageToViewRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  messageToView?: ObjectId | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

function Activities(props: ActivitiesProps) {
  const {
    activities,
    profiles,
    messageToViewRef,
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
      onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
      className="messages-container flex-1 overflow-y-auto py-4"
    >
      {activities.map((activity, i) => {
        if (activity.activityType === 'message') {
          const sender = profiles.find((p) => p.id === activity.senderId);

          if (!sender) {
            console.error('Sender not found in activity profiles', {
              message: activity,
              senderId: activity.senderId,
            });
          }
          const messageWithSender = {
            ...activity,
            sender: sender ?? PROFILE_FALLBACK,
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

        const actioningProfile = profiles.find(
          (p) => p.id === activity.actorId
        );
        const targetProfile = profiles.find((p) => p.id === activity.targetId);

        if (!actioningProfile) {
          console.error('Actioner not found in activity profiles', {
            action: activity,
            actorId: activity.actorId,
          });
        }

        const actionWithActor = {
          ...activity,
          actor: actioningProfile ?? PROFILE_FALLBACK,
          target: targetProfile ?? null,
        };

        return <ActionBubble key={activity.id} action={actionWithActor} />;
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
