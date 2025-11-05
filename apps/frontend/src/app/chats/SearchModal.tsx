import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { useMessages } from '@/hooks/messages';
import { getChatName } from '@/utils';
import { ChatListDTO, ListProfileDTO, ObjectId } from '@repo/common';
import { useState } from 'react';
import * as R from 'remeda';

export function SearchModal() {
  const { closeModal } = useModalContext();
  const [searchInput, setSearchInput] = useState('');

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
    <div>
      <div>
        {combinedList.length > 0 &&
          combinedList.map((item) => {
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
        <h5>Texts</h5>
        <div></div>
      </div>
      <div>
        <h5>Photos</h5>
        <div></div>
      </div>

      <div></div>
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
      : getChatName(props.groupChat);

  return (
    <div className="chat-result-item">
      {type === 'profile' ? (
        <Avatar
          firstName={props.profile.firstName}
          lastName={props.profile.lastName}
          avatarUrl={props.profile.avatarUrl}
        />
      ) : (
        <GroupAvatar
          groupPictureUrl={props.groupChat.groupPictureUrl}
          participants={props.groupChat.participants}
        />
      )}
      <span>{displayName}</span>
    </div>
  );
}

interface AvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  className?: string;
  size?: number;
  rounded?: boolean;
}

export function Avatar(props: AvatarProps) {
  const {
    firstName,
    lastName,
    avatarUrl,
    className = '',
    size = 40,
    rounded = true,
  } = props;
  const initials = R.toUpperCase(`${firstName[0]}${lastName[0]}`);
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={`${firstName} ${lastName}`}
      className={`${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`flex items-center justify-center bg-gray-300 text-white font-bold ${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size / 2 }}
    >
      {initials}
    </div>
  );
}

const POSITIONS = [
  // 2 participants
  [
    { x: 0.15, y: 0.15 },
    { x: 0.55, y: 0.55 },
  ],
  // 3 participants...
  [
    { x: 0.5, y: 0.1 },
    { x: 0.1, y: 0.6 },
    { x: 0.7, y: 0.6 },
  ],
  [
    { x: 0.1, y: 0.1 },
    { x: 0.6, y: 0.1 },
    { x: 0.1, y: 0.6 },
    { x: 0.6, y: 0.6 },
  ],
  [
    { x: 0.5, y: 0.05 },
    { x: 0.1, y: 0.35 },
    { x: 0.7, y: 0.35 },
    { x: 0.25, y: 0.7 },
    { x: 0.6, y: 0.7 },
  ],
];

export interface GroupAvatarProps {
  groupPictureUrl: string | null;
  // TODO: change this?
  participants: {
    id: ObjectId;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  }[];
  size?: number;
  className?: string;
}

export function GroupAvatar(props: GroupAvatarProps) {
  const { groupPictureUrl, participants, size = 48, className = '' } = props;

  if (groupPictureUrl) {
    return (
      <img
        src={groupPictureUrl}
        alt="Group"
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Show 2-5 participant avatars, arranged in a cluster
  const displayParticipants = participants.slice(0, 5);
  const count = displayParticipants.length;
  const avatarSize = size / (count > 2 ? 1.5 : 1.2);

  const pos = POSITIONS[count - 2] || POSITIONS[POSITIONS.length - 1];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {displayParticipants.map((p, i) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: pos[i].x * size,
            top: pos[i].y * size,
            width: avatarSize,
            height: avatarSize,
            zIndex: count - i,
          }}
        >
          <Avatar
            firstName={p.firstName}
            lastName={p.lastName}
            avatarUrl={p.avatarUrl}
            size={avatarSize}
            rounded
          />
        </div>
      ))}
    </div>
  );
}
