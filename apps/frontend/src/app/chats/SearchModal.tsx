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
import { Dispatch, SetStateAction, useState, MouseEvent, useRef } from 'react';
import { ProfileResultItem } from '@/components/chats/ProfileResultItem';
import { ChatResultItem } from '@/components/chats/ChatResultItem';
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
  const [highlightedProfileId, setHighlightedProfileId] =
    useState<ObjectId | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchNameInput(e.target.value);
    // Remove highlight if user types
    if (highlightedProfileId) setHighlightedProfileId(null);
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
    setSearchNameInput('');
    setHighlightedProfileId(null);
    inputRef.current?.focus();
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
      <div className="flex justify-between items-center">
        <div></div>
        <h1 className="text-lg">New Message</h1>
        <button
          onClick={closeModal}
          className="p-0 border-none underline text-brand hover:text-brand-dark transition-colors"
        >
          Cancel
        </button>
      </div>
      <form className="flex items-start gap-2 p-4">
        <label htmlFor="chat-for" className="font-medium">
          For:
        </label>

        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {selectedProfiles.map((profile) => (
            <span
              key={profile.id}
              tabIndex={0}
              onClick={() => setHighlightedProfileId(profile.id)}
              onBlur={() => setHighlightedProfileId(null)}
              className={`px-2 py-1 bg-gray-100 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${highlightedProfileId === profile.id ? 'ring-2 ring-brand bg-brand-light text-brand-dark' : ''}`}
              onKeyDown={(e) => {
                if (
                  highlightedProfileId === profile.id &&
                  e.key === 'Backspace'
                ) {
                  setSelectedProfiles((prev) =>
                    prev.filter((p) => p.id !== profile.id)
                  );
                  setHighlightedProfileId(null);
                  inputRef.current?.focus();
                  e.preventDefault();
                }
              }}
            >
              {`${profile.firstName} ${profile.lastName}`}
            </span>
          ))}
          <input
            id="chat-for"
            onChange={handleChangeSearch}
            value={searchNameInput}
            autoFocus
            className="px-2 py-1 border-none focus:outline-none min-w-[120px] flex-shrink"
            style={{ flexBasis: '120px' }}
            ref={inputRef}
            onKeyDown={(e) => {
              if (
                e.key === 'Backspace' &&
                searchNameInput === '' &&
                selectedProfiles.length > 0
              ) {
                // Highlight last profile if input is empty and backspace is pressed
                setHighlightedProfileId(
                  selectedProfiles[selectedProfiles.length - 1].id
                );
              }
            }}
          />
        </div>
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
