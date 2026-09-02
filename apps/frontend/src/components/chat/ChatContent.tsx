import { SelectedProfile } from '@/types/profile';

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
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as R from 'remeda';
import { GroupPhoto } from '../GroupPhoto';
import { FullscreenModal } from '../modal/FullscreenModal';
import { ProfileAvatar } from '../ProfileAvatar';
import { Activities } from './Activities';
import { GroupChatInfo } from './GroupChatInfo';
import { useChatActivities } from '@/hooks/activity';
import { ProfileContent } from '@/app/profile/profileContent';
import { ImageUpload } from '../ImageUpload';
import LoadingSpinner from '../LoadingSpinner';

interface ChatContentProps {
  chatId: ObjectId | null;
  messageToView?: ObjectId | null;
  profiles?: SelectedProfile[];
  inModalView?: boolean;
  isComposeMessageView?: boolean;
  shouldFocusChatInput?: boolean;
}

interface ChatImageFormValues {
  imageUrl: string | null;
}

export function ChatContent(props: ChatContentProps) {
  const hasScrolledOnFirstRender = useRef(false);
  const hadImageInputOnLastRender = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageToViewRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const { navigateToChat } = useNavigation();
  const { launchModal } = useModalContext();

  const {
    chatId,
    messageToView,
    profiles,
    inModalView = false,
    isComposeMessageView = false,
    shouldFocusChatInput = false,
  } = props;

  const { profile } = useAuth();
  const loggedInProfileId = profile?.id;
  const { value: textInput, setValue: setTextInput } = useInput();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { control, watch, setValue } = useForm<ChatImageFormValues>({
    defaultValues: {
      imageUrl: null,
    },
  });
  const imageUrlInput = watch('imageUrl');

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

  const { chat, isLoading, error } = useChat(params);
  const {
    sendMessage,
    allActivities,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isSendingMessage,
  } = useChatActivities(chat?.id, profileIds);

  const hasTextInput = textInput.length > 0; // allow sending blank messages
  const hasImageInput = R.isTruthy(imageUrlInput);
  const canSubmitMessage =
    (hasTextInput || hasImageInput) && !(isUploadingImage || isSendingMessage);

  // clear text input if user adds an image
  useEffect(() => {
    if (
      hasImageInput &&
      !hadImageInputOnLastRender.current &&
      textInput.length
    ) {
      setTextInput('');
    }

    hadImageInputOnLastRender.current = hasImageInput;
  }, [hasImageInput, setTextInput, textInput.length]);

  // focus message input so user can include text with image
  useEffect(() => {
    if (!hasImageInput) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [hasImageInput]);

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

  const clearSelectedImage = useCallback(() => {
    setValue('imageUrl', null);
    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  }, [setValue]);

  const handleMessageInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      }

      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
      return;
    }

    if (e.key !== 'Backspace') {
      return;
    }

    if (!hasImageInput || textInput.length > 0) {
      return;
    }

    e.preventDefault();
    clearSelectedImage();
  };

  const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) {
      console.error('Profile required to send message');
      return;
    }

    if (!canSubmitMessage) {
      return;
    }

    const selectedImageUrl = imageUrlInput;
    // allow reassignment in the case of new chat creation
    let resolvedChatId = chat?.id ?? null;

    try {
      if (selectedImageUrl) {
        const imageChatId = await sendMessage({
          senderId: profile.id,
          type: 'IMAGE',
          content: null,
          imageUrl: selectedImageUrl,
          chatId: resolvedChatId ?? undefined,
          participantProfileIds: profileIds,
        });

        resolvedChatId = imageChatId;
        setValue('imageUrl', null);
      }

      if (textInput) {
        const textChatId = await sendMessage({
          senderId: profile.id,
          type: 'TEXT',
          content: textInput,
          imageUrl: null,
          chatId: resolvedChatId ?? undefined,
          participantProfileIds: profileIds,
        });

        resolvedChatId = textChatId;
        setTextInput('');
      }

      if (inModalView && resolvedChatId) {
        navigateToChat(resolvedChatId);
      }

      window.requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    } catch (error) {
      console.error('Failed to send message(s)', error);
    }
  };

  const draftParticipantProfiles: BaseProfileDTO[] =
    profiles?.map((selectedProfile) => ({
      ...selectedProfile,
      avatarUrl: null,
      isOnline: undefined,
      lastOnline: undefined,
    })) ?? [];

  console.log(chat);
  console.log(draftParticipantProfiles);
  const isDraftChat = (!chat && draftParticipantProfiles.length > 0) || error;

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
    truncate: 40,
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

  const containerClass = inModalView
    ? 'flex h-full min-h-0 flex-col'
    : 'flex h-screen flex-col';

  return (
    <div className={containerClass}>
      {!isComposeMessageView && (
        <div className="header-container pt-2 pb-0 px-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
          <Link href="/chats" className="no-underline text-inherit">
            <i className="bi bi-caret-left-fill text-3xl" />
          </Link>

          <div className="flex flex-col items-center justify-center">
            <ChatPhoto
              chatType={type}
              chat={chat}
              otherParticipantProfiles={otherParticipantProfiles}
              size={40}
            />

            <h1 className="text-lg font-semibold text-center leading-tight mt-3 mb-1">
              {displayName}
            </h1>
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
          <i className="bi bi-info-circle text-3xl" onClick={handleInfoClick} />
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
        className="send-message-form flex gap-3 justify-between items-end p-2 flex-shrink-0 bg-white border-t"
      >
        <div className="shrink-0">
          <ImageUpload<ChatImageFormValues>
            name="imageUrl"
            control={control}
            onUploadingChange={setIsUploadingImage}
            // imageClassName="h-10 w-10 rounded-lg border border-gray-200 object-cover"
            maintainFallback={true}
            fallback={
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100">
                <i className="bi bi-image text-lg" />
              </div>
            }
          />
        </div>
        <div className="flex min-w-0 flex-1 items-end gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
          {isUploadingImage ? (
            <LoadingSpinner className="h-5 w-5 text-gray-400" />
          ) : hasImageInput ? (
            <div className="relative shrink-0">
              <img
                src={imageUrlInput ?? ''}
                alt="Selected image"
                className="h-12 w-12 rounded-md object-cover"
              />
              <button
                type="button"
                onClick={clearSelectedImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition hover:bg-gray-700"
                aria-label="Remove selected image"
              >
                <i className="bi bi-x text-[10px]" />
              </button>
            </div>
          ) : null}

          <textarea
            ref={messageInputRef}
            name="message"
            autoComplete="off"
            placeholder={
              hasImageInput || isUploadingImage ? '' : 'Type a message…'
            }
            rows={1}
            className="flex-1 resize-none bg-transparent px-0 py-0 ring-0 focus:outline-none focus:ring-0 field-sizing-content max-h-[5lh] overflow-y-auto"
            aria-label="Message input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleMessageInputKeyDown}
          />
        </div>
        <button type="submit" disabled={!canSubmitMessage}>
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
  size?: number;
}

function ChatPhoto(props: ChatPhotoProps) {
  const { chatType, chat, otherParticipantProfiles, size } = props;

  if (chatType === 'GROUP') {
    return (
      <GroupPhoto
        groupPictureUrl={chat?.groupPictureUrl || null}
        participantProfiles={otherParticipantProfiles}
        size={size}
      />
    );
  }

  const otherProfile = otherParticipantProfiles[0];

  if (otherProfile) {
    return <ProfileAvatar profile={otherProfile} size={size} />;
  }
}
