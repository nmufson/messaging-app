import { GroupPhoto } from '@/components/GroupPhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { useMessages } from '@/hooks/messages';
import { formatDisplayDate, getChatDisplayName } from '@/utils';
import {
  ChatListDTO,
  ListProfileDTO,
  MessageDTO,
  TextMessageSearchResultDTO,
  ObjectId,
  PhotoMessageSearchResultDTO,
} from '@repo/common';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from '../chat/[slug]/MessageBubble';

export function SearchModal() {
  const { closeModal } = useModalContext();
  const [searchInput, setSearchInput] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const { profiles, groupChats } = usePotentialChats({
    searchInput: searchInput,
    requireInput: false,
  });

  const combinedList: (ListProfileDTO | ChatListDTO)[] = [
    ...profiles,
    ...groupChats,
  ];

  const { textMessages, photoMessages } = useMessages({ searchInput });

  return (
    <div className="px-1">
      <div className="flex justify-between p-3">
        <div className="border border-black">
          <i className="bi bi-search" />
          <input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
          ></input>
        </div>
        <button className="border-none p-0" onClick={closeModal}>
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
        {combinedList.slice(0, 10).map((item) => {
          const parsedProfile = ListProfileDTO.safeParse(item);
          const parsedChat = ChatListDTO.safeParse(item);
          if (parsedProfile.success) {
            return (
              <ProfileOrChatItem
                type="profile"
                profile={parsedProfile.data}
                key={item.id}
              />
            );
          }
          if (parsedChat.success) {
            return (
              <ProfileOrChatItem
                type="groupChat"
                groupChat={parsedChat.data}
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
            <TextMessagePreview key={text.id} message={text} />
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

function PhotoMessagePreview({
  photoMessage,
}: {
  photoMessage: PhotoMessageSearchResultDTO;
}) {
  const { imageUrl, sender } = photoMessage;

  return (
    <div className="relative w-45 max-h-150 border-2 border-white">
      <img src={imageUrl} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2">
        <ProfileAvatar {...sender} />
      </div>
    </div>
  );
}

function TextMessagePreview({
  message,
}: {
  message: TextMessageSearchResultDTO;
}) {
  const { profile } = useAuth();
  const { closeModal } = useModalContext();
  const router = useRouter();
  const { content, sender, createdAt, chat } = message;
  const { name: chatName, participants } = chat;
  const { firstName, lastName } = sender;

  const senderDisplayName = `${firstName} ${lastName}`;
  const displayDate = formatDisplayDate(createdAt);

  const chatDisplayName = getChatDisplayName({
    name: chat.name || null,
    participants: chat.participants || [],
    profileId: profile?.id,
    truncate: 50,
  });

  const handleNavigateToMessage = () => {
    const chatId = message.chat.id;

    router.push(`/chat/chat?chat=${chatId}&message=${message.id}`);
    closeModal();
  };

  return (
    <div className="mb-2">
      {participants.length > 2 && (
        <strong className="text-sm">{chatDisplayName}</strong>
      )}
      <div className="flex justify-between">
        <small className="text-xs">{senderDisplayName}</small>
        <small className="text-xs">{displayDate}</small>
      </div>
      <div className="flex justify-between items-center">
        <MessageBubble message={message} showName={false} showTime={false} />
        <button onClick={handleNavigateToMessage} className="p-1">
          <i className="bi bi-caret-right-fill text-gray-700 text-3xl" />
        </button>
      </div>
    </div>
  );
}

type ChatResultItemProps =
  | { type: 'profile'; profile: ListProfileDTO }
  | { type: 'groupChat'; groupChat: ChatListDTO };

function ProfileOrChatItem(props: ChatResultItemProps) {
  const { type } = props;
  const displayName =
    type === 'profile'
      ? `${props.profile.firstName} ${props.profile.lastName}`
      : getChatDisplayName({ ...props.groupChat, truncate: 30 });

  return (
    <div className="flex flex-col items-center text-center w-[50px] whitespace-normal">
      {type === 'profile' ? (
        <ProfileAvatar
          firstName={props.profile.firstName}
          lastName={props.profile.lastName}
          avatarUrl={props.profile.avatarUrl}
        />
      ) : (
        <GroupPhoto
          groupPictureUrl={props.groupChat.groupPictureUrl}
          participants={props.groupChat.participants}
        />
      )}
      <span>{displayName}</span>
    </div>
  );
}
