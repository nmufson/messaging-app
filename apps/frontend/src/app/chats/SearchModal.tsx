'use client';

import { DEFAULT_PROFILE_IMAGE } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { getChatName } from '@/utils';
import {
  ListProfileDTO,
  ObjectId,
  ProfileDTO,
  SearchChatListDTO,
} from '@repo/common';
import { group } from 'console';
import { Dispatch, SetStateAction, useState, MouseEvent } from 'react';
import { ProfileContent } from '../profile/profileContent';
import { last } from 'remeda';
import { FullscreenModal } from '@/components/modal/FullscreenModal';

// TODO make friends list content, with both page and modal view

export interface SelectedProfile {
  id: ObjectId;
  firstName: string;
  lastName: string;
}

export function ChatSearchModal() {
  const { showModal, closeModal } = useModalContext();
  const [searchNameInput, setSearchNameInput] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<SelectedProfile[]>(
    []
  );
  const [selectedGroupChat, setSelectedGroupChat] = useState<ObjectId | null>(
    null
  );

  function handleChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchNameInput(e.target.value);
  }
  const selectedProfileIds = selectedProfiles.map((p) => p.id);
  const { profiles, groupChats } = usePotentialChats({
    searchString: searchNameInput,
    selectedProfiles: selectedProfileIds,
  });

  const handleProfileClick = (profile: ListProfileDTO) => {
    const { id, firstName, lastName } = profile;
    setSelectedProfiles((prev) => [
      ...prev,
      {
        id,
        firstName,
        lastName,
      },
    ]);
  };
  const handleGroupChatClick = (chatId: ObjectId) => {
    setSelectedGroupChat(chatId);
  };

  const handleClearSelections = () => {
    setSelectedGroupChat(null);
    setSelectedProfiles([]);
  };

  return (
    <div>
      <form className="flex items-center gap-2 p-4">
        <label htmlFor="chat-for" className="font-medium">
          For:
        </label>
        {/* // TODO: people we added (map over that) */}
        {selectedProfiles && <div></div>}

        <input
          id="chat-for"
          onChange={handleChangeSearch}
          className="flex-1 px-2 py-1 border rounded"
        />
        {/* TODO: click this for Friends List modal */}
        <button type="button" className="text-brand">
          <i className="bi bi-plus-circle" />
        </button>
      </form>

      {groupChats.length > 0 && (
        <div>
          <div>
            <h4>Chats</h4>
          </div>
          <div className="flex flex-col">
            {groupChats.map((chat) => (
              <ChatResultItem
                key={chat.id}
                chat={chat}
                onSelectChat={handleGroupChatClick}
                onClearSelections={handleClearSelections}
                setSelectedProfile={setSelectedProfiles}
              />
            ))}
          </div>
        </div>
      )}
      {profiles.length > 0 && (
        <div>
          <div>
            <h4>Friends</h4>
          </div>
          <div className="flex flex-col">
            {profiles.map((profile) => (
              <ProfileResultItem
                key={profile.id}
                profile={profile}
                onAddProfile={handleProfileClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ProfileResultItemProps {
  profile: ListProfileDTO;
  onAddProfile: (profile: ListProfileDTO) => void;
}

function ProfileResultItem(props: ProfileResultItemProps) {
  const { profile, onAddProfile } = props;
  const { firstName, lastName, avatarUrl, id: profileId } = profile;
  const profileDisplayName = `${firstName} ${lastName}`;
  const profileImage = avatarUrl ? avatarUrl : DEFAULT_PROFILE_IMAGE;

  return (
    <button
      type="button"
      onClick={() => onAddProfile(profile)}
      className="flex items-center p-3 border-b border-grey-200 w-full text-left"
    >
      <img
        src={profileImage}
        alt="Profile Picture"
        className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-brand-light"
      />
      <p className="text-lg">{profileDisplayName}</p>
    </button>
  );
}

interface GroupChatResultItemProps {
  chat: SearchChatListDTO;
  onSelectChat: (chatId: ObjectId) => void;
  onClearSelections: () => void;
  setSelectedProfile: Dispatch<SetStateAction<SelectedProfile[]>>;
}

function ChatResultItem(props: GroupChatResultItemProps) {
  const { profile } = useAuth();
  const { chat, onSelectChat, onClearSelections, setSelectedProfile } = props;
  const { name, groupPictureUrl, participants, id: chatId } = chat;

  const chatDisplayName = getChatName({
    type: 'GROUP',
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
          // TODO: swap this for other group photo
          // make a component for multiple users profile pics like iMessage
          src={groupPictureUrl || DEFAULT_PROFILE_IMAGE}
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
          {participants.map((profile) => (
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

interface ChatProfileItemProps {
  profile: ListProfileDTO;
  onClearSelections: () => void;
  setSelectedProfile: Dispatch<SetStateAction<SelectedProfile[]>>;
}
export function ChatProfileItem(props: ChatProfileItemProps) {
  const { profile, onClearSelections, setSelectedProfile } = props;
  const { firstName, lastName, avatarUrl, id: profileId } = profile;
  const { launchModal } = useModalContext();
  const profileDisplayName = `${firstName} ${lastName}`;
  const profileImage = avatarUrl ? avatarUrl : DEFAULT_PROFILE_IMAGE;

  const handleProfileClick = () => {
    onClearSelections();
    setSelectedProfile([{ id: profileId, firstName, lastName }]);
  };

  const handleOpenProfileModal = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    launchModal(
      <FullscreenModal>
        <ProfileContent profileId={profile.id} />
      </FullscreenModal>
    );
  };

  return (
    <div
      onClick={handleProfileClick}
      className="flex justify-between items-center p-3 border-b border-grey-200"
    >
      <div className="flex">
        <img
          src={profileImage}
          alt="Profile Picture"
          className="w-10 h-10 rounded-full object-cover mr-4 border-2 border-brand-light"
        />
        <p className="text-lg">{profileDisplayName}</p>
      </div>

      {/* TODO: clicking this opens profile modal */}
      {/* make profile content component to be used in page and modal */}
      <div tabIndex={0} role="button" onClick={handleOpenProfileModal}>
        <i className="bi bi-info-circle" />
      </div>
    </div>
  );
}

// TODO: figure out how this works with phone
export function WriteChat() {
  return (
    <form className="flex items-center gap-2 p-4">
      <button type="button" className="text-brand">
        <i className="bi bi-plus" />
      </button>
      <input className="flex-1 px-2 py-1 border rounded" />
    </form>
  );
}
