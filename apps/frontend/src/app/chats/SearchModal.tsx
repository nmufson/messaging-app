import { GroupPhoto } from '@/components/GroupPhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { SearchInput } from '@/components/SearchInput';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { ChatContent } from '@/components/chat/ChatContent';
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
import { useEffect } from 'react';
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
      closeModal();
    }
  }, [
    selectedProfile,
    isCheckingDirectChat,
    existingDirectChat,
    navigateToChat,
    closeModal,
  ]);

  const handleSelectGroupChat = (chatId: ObjectId) => {
    navigateToChat(chatId);
    closeModal();
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
    <div className="search-modal px-1">
      <div className="flex justify-between items-center gap-3 p-3">
        <SearchInput
          value={searchInput}
          onChange={onChangeSearchInput}
          autoFocus
        />
        <button className="border-none p-0" onClick={closeModal}>
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
        {combinedList.slice(0, 10).map((item) => {
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
      <div>
        <h5>Messages</h5>
        <div>
          {textMessages?.slice(0, 5).map((text) => (
            <TextMessagePreview
              key={text.id}
              textMessage={text}
              onNavigateToMessage={navigateToMessage}
              closeModal={closeModal}
            />
          ))}
        </div>
      </div>
      <div>
        <h5>Photos</h5>
        <div className="flex flex-wrap">
          {photoMessages?.map((message) => (
            <PhotoMessagePreview
              key={message.id}
              photoMessage={message}
              onNavigateToMessage={navigateToMessage}
              closeModal={closeModal}
            />
          ))}
        </div>
      </div>
      {/* Allow composing message before chat is created */}
      {selectedProfile && !isCheckingDirectChat && !existingDirectChat && (
        <div className="mt-4 border-t pt-3">
          <ChatContent
            chatId={null}
            profiles={[selectedProfile]}
            inModalView={true}
            isComposeMessageView={true}
          />
        </div>
      )}
    </div>
  );
}

interface PhotoMessagePreviewProps {
  photoMessage: PhotoMessageSearchResultDTO;
  onNavigateToMessage: (chatId: ObjectId, messageId: ObjectId) => void;
  closeModal: () => void;
}

function PhotoMessagePreview(props: PhotoMessagePreviewProps) {
  const { photoMessage, onNavigateToMessage, closeModal } = props;
  const { imageUrl, sender, chatId, id: messageId } = photoMessage;

  const handleNavigateToMessage = () => {
    onNavigateToMessage(chatId, messageId);
    closeModal();
  };

  return (
    <div
      onClick={handleNavigateToMessage}
      className="relative w-45 max-h-150 border-2 border-white"
    >
      <img src={imageUrl} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2">
        <ProfileAvatar profile={sender} />
      </div>
    </div>
  );
}

interface TextMessagePreviewProps {
  textMessage: TextMessageSearchResultDTO;
  onNavigateToMessage: (chatId: ObjectId, messageId: ObjectId) => void;
  closeModal: () => void;
}

function TextMessagePreview(props: TextMessagePreviewProps) {
  const { textMessage, onNavigateToMessage, closeModal } = props;
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

  const handleNavigateToMessage = () => {
    onNavigateToMessage(chat.id, textMessage.id);
    closeModal();
  };

  return (
    <div className="mb-2">
      {participantProfiles.length > 2 && (
        <strong className="text-sm">{chatDisplayName}</strong>
      )}
      <div className="flex justify-between">
        <small className="text-xs">{senderDisplayName}</small>
        <small className="text-xs">{displayDate}</small>
      </div>
      <div className="flex justify-between items-center">
        <MessageBubble
          message={textMessage}
          showName={false}
          showTime={false}
          onClick={handleNavigateToMessage}
        />
        <button onClick={handleNavigateToMessage} className="p-1">
          <i className="bi bi-caret-right-fill text-gray-700 text-3xl" />
        </button>
      </div>
    </div>
  );
}

interface ProfileSearchItemProps {
  profile: BaseProfileDTO;
  onSelectProfile: (profile: BaseProfileDTO) => void;
}

function ProfileSearchItem(props: ProfileSearchItemProps) {
  const { profile, onSelectProfile } = props;
  const displayName = `${profile.firstName} ${profile.lastName}`;

  return (
    <button
      type="button"
      onClick={() => onSelectProfile(profile)}
      className="profile-search-item flex flex-col items-center text-center w-[50px] whitespace-normal border-none bg-transparent p-0"
    >
      <ProfileAvatar profile={profile} />
      <span>{displayName}</span>
    </button>
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
    <button
      type="button"
      onClick={() => onSelectChat(groupChat.id)}
      className="gc-search-item flex flex-col items-center text-center w-[50px] whitespace-normal border-none bg-transparent p-0"
    >
      <GroupPhoto
        groupPictureUrl={groupChat.groupPictureUrl}
        participantProfiles={participantProfiles}
      />
      <span>{displayName}</span>
    </button>
  );
}
