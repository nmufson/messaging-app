import { GroupPhoto } from '@/components/GroupPhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { SearchInput } from '@/components/SearchInput';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { useMessages } from '@/hooks/messages';
import { formatDisplayDate, getChatDisplayName } from '@/utils';
import { useNavigation } from '@/utils/Navigation';
import {
  BaseProfileDTO,
  ChatListItemDTO,
  PhotoMessageSearchResultDTO,
  TextMessageSearchResultDTO,
} from '@repo/common';

import { MessageBubble } from '../chat/[slug]/MessageBubble';
import { useInput } from '@/hooks/general';

export function SearchModal() {
  const { closeModal } = useModalContext();
  const { value: searchInput, onChange: onChangeSearchInput } = useInput();

  const { profiles, groupChats } = usePotentialChats({
    searchInput: searchInput,
    requireInput: false,
  });

  const combinedList: (ChatListItemDTO | BaseProfileDTO)[] = [
    ...groupChats,
    ...profiles,
  ];

  const { textMessages, photoMessages } = useMessages({ searchInput });

  return (
    <div className="px-1">
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
              <GroupChatSearchItem groupChat={parsedChat.data} key={item.id} />
            );
          }

          if (parsedProfile.success) {
            return (
              <ProfileSearchItem profile={parsedProfile.data} key={item.id} />
            );
          }
        })}
      </div>
      <div>
        <h5>Messages</h5>
        <div>
          {textMessages?.slice(0, 5).map((text) => (
            <TextMessagePreview key={text.id} textMessage={text} />
          ))}
        </div>
      </div>
      <div>
        <h5>Photos</h5>
        <div className="flex flex-wrap">
          {photoMessages?.map((message) => (
            <PhotoMessagePreview key={message.id} photoMessage={message} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PhotoMessagePreviewProps {
  photoMessage: PhotoMessageSearchResultDTO;
}

function PhotoMessagePreview({ photoMessage }: PhotoMessagePreviewProps) {
  const { imageUrl, sender, chatId, id: messageId } = photoMessage;
  const { navigateToMessage } = useNavigation();

  const handleNavigateToMessage = () => {
    navigateToMessage(chatId, messageId);
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
}

function TextMessagePreview({ textMessage }: TextMessagePreviewProps) {
  const { profile } = useAuth();
  const { navigateToMessage } = useNavigation();

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
    navigateToMessage(chat.id, textMessage.id);
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
}

function ProfileSearchItem(props: ProfileSearchItemProps) {
  const { profile } = props;
  const displayName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="flex flex-col items-center text-center w-[50px] whitespace-normal">
      <ProfileAvatar profile={profile} />
      <span>{displayName}</span>
    </div>
  );
}

interface GroupChatSearchItemProps {
  groupChat: ChatListItemDTO;
}

function GroupChatSearchItem(props: GroupChatSearchItemProps) {
  const { groupChat } = props;
  const participantProfiles = groupChat.participants.map((p) => p.profile);

  const displayName = getChatDisplayName({
    name: groupChat.name,
    participantProfiles,
    truncate: 30,
  });

  return (
    <div className="flex flex-col items-center text-center w-[50px] whitespace-normal">
      <GroupPhoto
        groupPictureUrl={groupChat.groupPictureUrl}
        participantProfiles={participantProfiles}
      />
      <span>{displayName}</span>
    </div>
  );
}
