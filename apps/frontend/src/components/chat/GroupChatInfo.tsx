import { useAuth } from '@/context/AuthContext';
import { getChatDisplayName } from '@/utils';
import { ChatDTO } from '@repo/common';
import { ProfilePreview } from '../profile/ProfilePreview';
import { GroupPhoto } from '../GroupPhoto';
import { useState } from 'react';

interface GroupChatInfoProps {
  chat: ChatDTO;
}

export function GroupChatInfo(props: GroupChatInfoProps) {
  const [editMode, setEditMode] = useState(false);
  const { chat } = props;
  const { profile } = useAuth();
  const {
    id: chatId,
    type,
    name,
    creatorId,
    participants,
    messages,
    groupPictureUrl,
    createdAt: chatCreatedAt,
  } = chat;

  const displayName = getChatDisplayName({
    name,
    participants,
    profileId: profile?.id,
  });

  const handleSaveClick = (e) => {
    e.preventDefault();
    setEditMode(false);
    // TODO: handle mutation and set queryData
  };

  return (
    <div>
      <form>
        <GroupPhoto
          groupPictureUrl={groupPictureUrl}
          participants={participants}
        />
        <h1>{displayName}</h1>
        {!editMode ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              setEditMode(true);
            }}
          >
            Change name or picture
          </button>
        ) : (
          <button onClick={handleSaveClick}></button>
        )}
      </form>

      <div>
        <h3>Members</h3>
        <div>
          {participants.map((p) => (
            <ProfilePreview key={p.id} profile={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
