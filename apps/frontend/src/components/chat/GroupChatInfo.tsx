import { useAuth } from '@/context/AuthContext';
import { getChatDisplayName } from '@/utils';
import { ChatDTO } from '@repo/common';
import { ProfilePreview } from '../profile/ProfilePreview';
import { GroupPhoto } from '../GroupPhoto';
import { useState } from 'react';
import { MouseEvent } from 'react';
import { useToggle } from '@/hooks/general';

interface GroupChatInfoProps {
  chat: ChatDTO;
}

export function GroupChatInfo(props: GroupChatInfoProps) {
  const { status: editMode, toggleStatus: toggleEditMode } = useToggle();

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

  const handleSaveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleEditMode();
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
              toggleEditMode();
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
            <ProfilePreview key={p.id} profile={p} showPresence={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
