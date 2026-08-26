import { SelectedProfile } from '@/types/profile';
import { ProfileContent } from '@/app/profile/ProfileContent';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useChat } from '@/hooks/chat';
import { useInput } from '@/hooks/general';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { getChatDisplayName } from '@/utils';
import { getParticipantProfiles } from '@/utils/general';
import { useNavigation } from '@/utils/Navigation';
import { BaseProfileDTO, ChatInfoDTO, ChatType, ObjectId } from '@repo/common';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useRef } from 'react';
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
  isComposeMessageView?: boolean;
  shouldFocusChatInput?: boolean;
}

export function ChatContent(props: ChatContentProps) {
  const hasScrolledOnFirstRender = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageToViewRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { navigateToChat } = useNavigation();
  const { launchModal } = useModalContext();

  // TODO: can simply make inModalView check if we're at chat path or not??
  const {
    chatId,
    messageToView,
    profiles,
    inModalView = false,
    isComposeMessageView = false,
    shouldFocusChatInput = false,
  } = props;
  console.log(profiles);
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
    friendsOnly: false,
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatActivities(chat?.id, profileIds);

  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  useEffect(() => {
    hasScrolledOnFirstRender.current = false;
  }, [pathname, chatId]);

  useEffect(() => {
    if (messageToView && messageToViewRef.current) {
      messageToViewRef.current.scrollIntoView({ behavior: 'instant' });
      return;
    }

    if (!hasScrolledOnFirstRender.current && allActivities.length > 0) {
      const frameId = window.requestAnimationFrame(() => {
        scrollToBottom('auto');
      });

      hasScrolledOnFirstRender.current = true;
      return () => window.cancelAnimationFrame(frameId);
    }
  }, [messageToView, scrollToBottom, allActivities.length]);

  useEffect(() => {
    if (!shouldFocusChatInput || isLoading) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [shouldFocusChatInput, isLoading, chatId]);

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

        window.requestAnimationFrame(() => {
          scrollToBottom('smooth');
        });
      },
    });

    setTextInput('');
    setImageUrlInput('');
    console.log('Message sent successfully!');
  };

  if (isLoading) return <Spinner />;
  const draftParticipantProfiles: BaseProfileDTO[] =
    profiles?.map((selectedProfile) => ({
      ...selectedProfile,
      avatarUrl: null,
      isOnline: undefined,
      lastOnline: undefined,
    })) ?? [];

  const isDraftChat = !chat && draftParticipantProfiles.length > 0;

  if (!chat && !isDraftChat) return <div>Chat not found.</div>;

  const participants = chat?.participants;
  const participantProfiles = participants
    ? getParticipantProfiles(participants)
    : draftParticipantProfiles;
  const name = chat?.name ?? null;
  const type: ChatType =
    chat?.type ??
    (participantProfiles.length > 1
      ? ChatType.enum.GROUP
      : ChatType.enum.DIRECT);

  const displayName = getChatDisplayName({
    name,
    participantProfiles: participantProfiles || profiles,
    profileId: loggedInProfileId,
  });

  const otherParticipantProfiles = participantProfiles.filter(
    (p) => p.id !== loggedInProfileId
  );

  const handleInfoClick = () => {
    if (!chat) {
      return;
    }

    if (type === 'GROUP') {
      launchModal(
        <FullscreenModal header="Group Info">
          <GroupChatInfo chatId={chat.id} onScrollToBottom={scrollToBottom} />
        </FullscreenModal>
      );
    } else if (type === 'DIRECT' && otherParticipantProfiles[0]) {
      launchModal(
        <FullscreenModal header="Chat">
          <ProfileContent
            profileId={otherParticipantProfiles[0].id}
            showBackButton={false}
          />
        </FullscreenModal>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {!isComposeMessageView && (
        <div className="header-container pt-2 pb-0 px-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
          <Link href="/chats" className="no-underline text-inherit">
            <i className="bi bi-caret-left-fill text-3xl" />
          </Link>

          <div className="flex flex-col items-center">
            <ChatPhoto
              chatType={type}
              chat={chat}
              otherParticipantProfiles={otherParticipantProfiles}
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
                  <span>
                    {type === 'GROUP' && numParticipantsOnline} Online
                  </span>
                </div>
              </OverlayTrigger>
            )}
          </div>
          {/* opens modal for user profile if in direct chat, or group info if in group chat */}
          <i className="bi bi-info-circle text-2xl" onClick={handleInfoClick} />
        </div>
      )}
      <Activities
        activities={allActivities}
        messageToViewRef={messageToViewRef}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        messageToView={messageToView}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />

      {isDraftChat && (
        <div className="px-4 py-2 text-center text-sm text-gray-500 border-t border-gray-100">
          New conversation. Send your first message to create this chat.
        </div>
      )}

      <form
        onSubmit={handleSubmitMessage}
        className="send-message-form flex gap-3 justify-between items-center p-2 flex-shrink-0 bg-white border-t"
      >
        <div>
          <i className="bi bi-image text-3xl" />
        </div>
        <input
          ref={messageInputRef}
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

// Don't include user's profile in group photo
interface ChatPhotoProps {
  chatType: ChatType;
  chat?: ChatInfoDTO;
  otherParticipantProfiles: BaseProfileDTO[];
}

function ChatPhoto(props: ChatPhotoProps) {
  const { chatType, chat, otherParticipantProfiles } = props;

  if (chatType === 'GROUP') {
    return (
      <GroupPhoto
        groupPictureUrl={chat?.groupPictureUrl || null}
        participantProfiles={otherParticipantProfiles}
      />
    );
  }

  const otherProfile = otherParticipantProfiles[0];

  if (otherProfile) {
    return <ProfileAvatar profile={otherProfile} />;
  }
}
