import { SelectedProfile } from '@/app/chats/WriteToChatModal';
import { ProfileContent } from '@/app/profile/profileContent';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useChat } from '@/hooks/chat';
import { useInput } from '@/hooks/general';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { getChatDisplayName } from '@/utils';
import { getParticipantProfiles } from '@/utils/general';
import { useNavigation } from '@/utils/Navigation';
import {
  BaseProfileDTO,
  ChatDTO,
  ChatInfoDTO,
  ChatType,
  ObjectId,
} from '@repo/common';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef } from 'react';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import * as R from 'remeda';
import { GroupPhoto } from '../GroupPhoto';
import { FullscreenModal } from '../modal/FullscreenModal';
import { ProfileAvatar } from '../ProfileAvatar';
import { Activities } from './Activities';
import { GroupChatInfo } from './GroupChatInfo';
import { useChatActivities } from '@/hooks/activity';

interface ChatContentProps {
  chatId: ObjectId | null;
  messageToView?: ObjectId | null;
  profiles?: SelectedProfile[];
  inModalView?: boolean;
}

export function ChatContent(props: ChatContentProps) {
  const isFirstRender = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageToViewRef = useRef<HTMLDivElement>(null);
  const { navigateToChat } = useNavigation();
  const { launchModal } = useModalContext();

  // TODO: can simply make inModalView check if we're at chat path or not??
  const { chatId, messageToView, profiles, inModalView = false } = props;
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
      loggedInProfileId,
    };
  }, [chatId, loggedInProfileId, profileIds]);

  const { chat, isLoading } = useChat(params);
  const {
    sendMessage,
    allActivities,
    isActivitiesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatActivities(chat?.id, profileIds);

  useEffect(() => {
    if (messageToView && messageToViewRef.current) {
      messageToViewRef.current.scrollIntoView({ behavior: 'instant' });
      return;
    }

    // Only scroll to bottom on initial load
    if (
      !isActivitiesLoading &&
      messagesEndRef.current &&
      isFirstRender.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
      isFirstRender.current = false;
    }
  }, [isActivitiesLoading, messageToView]);

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
  const participantProfiles = getParticipantProfiles(participants);

  // const participantProfiles = participants.map((p) => p.profile);

  const displayName = getChatDisplayName({
    name,
    participantProfiles: participantProfiles || profiles,
    profileId: loggedInProfileId,
  });

  const otherParticipantProfile =
    type === 'DIRECT'
      ? participantProfiles.find((p) => p.id !== loggedInProfileId)
      : null;

  const handleInfoClick = () => {
    if (type === 'GROUP') {
      launchModal(
        <FullscreenModal title="Group Info">
          <GroupChatInfo chatId={chat.id} />
        </FullscreenModal>
      );
    } else if (type === 'DIRECT' && otherParticipantProfile) {
      launchModal(
        <FullscreenModal title="Chat">
          <ProfileContent profileId={otherParticipantProfile.id} />
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

        <div className="flex flex-col items-center">
          <ChatPhoto
            chatType={type}
            chat={chat}
            participantProfiles={participantProfiles}
            otherParticipantProfile={otherParticipantProfile}
          />

          <h1 className="text-xl font-semibold">{displayName}</h1>
          {/* TODO: clean this up */}
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
        participants={participants}
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

interface ChatPhotoProps {
  chatType: ChatType;
  chat?: ChatInfoDTO;
  participantProfiles: BaseProfileDTO[];
  otherParticipantProfile?: BaseProfileDTO | null;
}

function ChatPhoto(props: ChatPhotoProps) {
  const { chatType, chat, participantProfiles, otherParticipantProfile } =
    props;

  if (chatType === 'GROUP') {
    return (
      <GroupPhoto
        groupPictureUrl={chat?.groupPictureUrl || null}
        participantProfiles={participantProfiles}
      />
    );
  }

  if (otherParticipantProfile) {
    return <ProfileAvatar profile={otherParticipantProfile} />;
  }

  // TODO: add fallback (img of question mark)
}
