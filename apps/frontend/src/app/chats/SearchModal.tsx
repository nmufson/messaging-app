import { GroupPhoto } from '@/components/GroupPhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { SearchInput } from '@/components/SearchInput';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useChat, usePotentialChats } from '@/hooks/chat';
import { useMessages } from '@/hooks/messages';
import { formatDisplayDate, getChatDisplayName } from '@/utils';
import { useNavigation } from '@/utils/Navigation';
import {
  BaseProfileDTO,
  ChatListItemDTO,
  ObjectId,
  PhotoMessageSearchResultDTO,
  TextMessageSearchResultDTO,
} from '@repo/common';

import { MessageBubble } from '../chat/[slug]/MessageBubble';
import { useInput, useSelectedValue } from '@/hooks/general';
import { ReactNode, useEffect } from 'react';
import { SelectedProfile } from '@/types/profile';

export function SearchModal() {
  const { navigateToChat, navigateToMessage } = useNavigation();
  const { closeModal } = useModalContext();
  const { value: searchInput, onChange: onChangeSearchInput } = useInput();
  const { value: selectedProfile, onChange: onSelectedProfileChange } =
    useSelectedValue<SelectedProfile | null>(null);

  const { profiles, groupChats } = usePotentialChats({
    searchInput: searchInput,
    requireInput: false,
    includeOnlyExistingChats: true,
  });

  const { chat: existingDirectChat, isLoading: isCheckingDirectChat } = useChat(
    {
      chatId: null,
      profileIds: selectedProfile ? [selectedProfile.id] : [],
    }
  );

  // navigate to chat if we've loaded one
  useEffect(() => {
    if (selectedProfile && !isCheckingDirectChat && existingDirectChat) {
      navigateToChat(existingDirectChat.id);
    }
  }, [
    selectedProfile,
    isCheckingDirectChat,
    existingDirectChat,
    navigateToChat,
  ]);

  const handleSelectGroupChat = (chatId: ObjectId) => {
    navigateToChat(chatId);
  };

  const handleSelectProfile = (profile: BaseProfileDTO) => {
    onSelectedProfileChange({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  };

  const combinedList: (ChatListItemDTO | BaseProfileDTO)[] = [
    ...groupChats,
    ...profiles,
  ];

  const { textMessages, photoMessages } = useMessages({ searchInput });

  return (
    <div className="search-modal space-y-5 py-2 px-2 sm:px-1">
      <div className="top-container flex items-center mb-0 justify-between gap-3 border-b border-slate-200 pb-3">
        <SearchInput
          value={searchInput}
          onChange={onChangeSearchInput}
          autoFocus
        />
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
      <div className="grid max-h-[230px] grid-cols-3 gap-3 overflow-y-hidden border-b border-slate-200 py-2 mb-4">
        {combinedList.slice(0, 6).map((item) => {
          const parsedChat = ChatListItemDTO.safeParse(item);
          const parsedProfile = BaseProfileDTO.safeParse(item);

          if (parsedChat.success) {
            return (
              <GroupChatSearchItem
                groupChat={parsedChat.data}
                onSelectChat={handleSelectGroupChat}
                key={item.id}
              />
            );
          }

          if (parsedProfile.success) {
            return (
              <ProfileSearchItem
                profile={parsedProfile.data}
                onSelectProfile={handleSelectProfile}
                key={item.id}
              />
            );
          }
        })}
      </div>
      <div className="space-y-3">
        <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Messages
        </h5>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {textMessages?.slice(0, 5).map((text) => (
            <TextMessagePreview
              key={text.id}
              textMessage={text}
              onNavigateToMessage={() => {
                navigateToMessage(text.chat.id, text.id);
              }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Photos
        </h5>
        <div className="grid max-h-[230px] grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {photoMessages?.map((message) => (
            <PhotoMessagePreview
              key={message.id}
              photoMessage={message}
              onNavigateToMessage={() => {
                navigateToMessage(message.chatId, message.id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PhotoMessagePreviewProps {
  photoMessage: PhotoMessageSearchResultDTO;
  onNavigateToMessage: () => void;
}

function PhotoMessagePreview(props: PhotoMessagePreviewProps) {
  const { photoMessage, onNavigateToMessage } = props;
  const { imageUrl, sender } = photoMessage;

  return (
    <div
      onClick={onNavigateToMessage}
      className="relative aspect-square w-34 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img src={imageUrl} className="h-full w-full object-cover" />
      <div className="absolute right-2 top-2 rounded-full bg-white/90 p-0.5 shadow-sm backdrop-blur-sm">
        <ProfileAvatar profile={sender} />
      </div>
    </div>
  );
}

interface TextMessagePreviewProps {
  textMessage: TextMessageSearchResultDTO;
  onNavigateToMessage: () => void;
}

function TextMessagePreview(props: TextMessagePreviewProps) {
  const { textMessage, onNavigateToMessage } = props;
  const { profile } = useAuth();

  const { sender, createdAt, chat } = textMessage;
  const { name: chatName, participants } = chat;
  const participantProfiles = participants.map(({ profile }) => profile);
  const { firstName, lastName } = sender;

  const senderDisplayName = `${firstName} ${lastName}`;
  const displayDate = formatDisplayDate(createdAt);

  const chatDisplayName = getChatDisplayName({
    name: chatName || null,
    participantProfiles,
    profileId: profile?.id,
    truncate: 50,
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {participantProfiles.length > 2 && (
        <strong className="text-sm font-semibold text-slate-900">
          {chatDisplayName}
        </strong>
      )}
      <div className="flex justify-between gap-2">
        <small className="text-xs font-medium text-slate-600">
          {senderDisplayName}
        </small>
        <small className="text-xs text-slate-500">{displayDate}</small>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <MessageBubble
          message={textMessage}
          showName={false}
          showTime={false}
          onClick={onNavigateToMessage}
        />
        <button
          type="button"
          onClick={onNavigateToMessage}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-brand hover:bg-brand hover:text-white"
        >
          <i className="bi bi-caret-right-fill text-base" />
        </button>
      </div>
    </div>
  );
}

interface ProfileSearchItemProps {
  profile: BaseProfileDTO;
  onSelectProfile: (profile: BaseProfileDTO) => void;
}

interface SearchListItemProps {
  onClick: () => void;
  displayName: string;
  children: ReactNode;
}

function SearchListItem(props: SearchListItemProps) {
  const { onClick, displayName, children } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className="search-list-item flex w-full flex-col items-center justify-center rounded-2xl border border-transparent bg-white p-2 text-center whitespace-normal shadow-sm transition hover:border-slate-200 hover:bg-brand-neutral"
    >
      {children}
      <span className="mt-2 text-[11px] font-medium leading-tight text-slate-700">
        {displayName}
      </span>
    </button>
  );
}

function ProfileSearchItem(props: ProfileSearchItemProps) {
  const { profile, onSelectProfile } = props;
  const displayName = `${profile.firstName} ${profile.lastName}`;

  return (
    <SearchListItem
      onClick={() => onSelectProfile(profile)}
      displayName={displayName}
    >
      <ProfileAvatar profile={profile} />
    </SearchListItem>
  );
}

interface GroupChatSearchItemProps {
  groupChat: ChatListItemDTO;
  onSelectChat: (chatId: ObjectId) => void;
}

function GroupChatSearchItem(props: GroupChatSearchItemProps) {
  const { groupChat, onSelectChat } = props;
  const participantProfiles = groupChat.participants.map((p) => p.profile);

  const displayName = getChatDisplayName({
    name: groupChat.name,
    participantProfiles,
    truncate: 30,
  });

  return (
    <SearchListItem
      onClick={() => onSelectChat(groupChat.id)}
      displayName={displayName}
    >
      <GroupPhoto
        groupPictureUrl={groupChat.groupPictureUrl}
        participantProfiles={participantProfiles}
      />
    </SearchListItem>
  );
}
