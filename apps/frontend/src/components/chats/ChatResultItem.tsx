import { useAuth } from '@/context/AuthContext';
import { getChatDisplayName } from '@/utils';
import { ChatListDTO, ListProfileDTO, ObjectId } from '@repo/common';
import { Dispatch, SetStateAction, useState, MouseEvent } from 'react';
import { ChatProfileItem } from './ChatProfileItem';

interface GroupChatResultItemProps {
  chat: ChatListDTO;
  onSelectChat: (chatId: ObjectId) => void;
  onClearSelections: () => void;
  setSelectedProfile: Dispatch<SetStateAction<any>>;
}

export function ChatResultItem(props: GroupChatResultItemProps) {
  const { chat, onSelectChat, onClearSelections, setSelectedProfile } = props;
  const { profile } = useAuth();
  const { name, groupPictureUrl, participants, id: chatId } = chat;

  const chatDisplayName = getChatDisplayName({
    name,
    participants,
    profileId: profile?.id,
  });
  const [showProfiles, setShowProfiles] = useState(false);

  const handleShowChatParticipants = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowProfiles((prev) => !prev);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelectChat(chatId)}
        className="flex items-center p-3 border-b border-grey-200 w-full text-left"
      >
        <img
          src={groupPictureUrl || '/default-profile.png'}
          alt="Profile Picture"
          className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-brand-light"
        />
        <p className="text-lg">{chatDisplayName}</p>
        <div
          onClick={handleShowChatParticipants}
          tabIndex={0}
          role="button"
          aria-label={showProfiles ? 'Hide participants' : 'Show participants'}
          className="ml-auto flex items-center cursor-pointer"
        >
          <i
            className={`bi bi-caret-right transition-transform duration-300 ${showProfiles ? 'rotate-90' : 'rotate-0'}`}
          />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${showProfiles ? 'max-h-100 opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ willChange: 'max-height, opacity' }}
      >
        <div className="flex flex-col">
          {participants.map((profile: ListProfileDTO) => (
            <ChatProfileItem
              key={profile.id}
              profile={profile}
              onClearSelections={onClearSelections}
              setSelectedProfile={setSelectedProfile}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
