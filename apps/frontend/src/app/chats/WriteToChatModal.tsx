'use client';

import { ChatContent } from '@/components/chat/ChatContent';
import { ChatResultItem } from '@/components/chats/ChatResultItem';
import { ProfileResultItem } from '@/components/chats/ProfileResultItem';
import { SelectedProfilesInput } from '@/components/chats/SelectedProfilesInput';
import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { ListProfileDTO, ObjectId } from '@repo/common';
import { useMemo, useState } from 'react';

// TODO make friends list content, with both page and modal view

export interface SelectedProfile {
  id: ObjectId;
  firstName: string;
  lastName: string;
}

export function WriteToChatModal() {
  const { closeModal } = useModalContext();
  const [searchNameInput, setSearchNameInput] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<SelectedProfile[]>(
    []
  );
  const [selectedGroupChat, setSelectedGroupChat] = useState<ObjectId | null>(
    null
  );
  const [highlightedProfileId, setHighlightedProfileId] =
    useState<ObjectId | null>(null);

  const selectedProfileIds = selectedProfiles.map((p) => p.id);

  const chatParams = useMemo(
    () => ({
      searchInput: searchNameInput,
      requireInput: true,
      selectedProfiles: selectedProfileIds,
    }),
    [searchNameInput, selectedProfileIds]
  );

  const { profiles, groupChats } = usePotentialChats(chatParams);

  const handleProfileClick = (profile: ListProfileDTO) => {
    const { avatarUrl, ...profileWithoutAvatar } = profile;

    setSelectedProfiles((prev) => [...prev, profileWithoutAvatar]);
    setSearchNameInput('');
    setHighlightedProfileId(null);
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
        <SelectedProfilesInput
          selectedProfiles={selectedProfiles}
          highlightedProfileId={highlightedProfileId}
          setHighlightedProfileId={setHighlightedProfileId}
          setSelectedProfiles={setSelectedProfiles}
          searchNameInput={searchNameInput}
          setSearchNameInput={setSearchNameInput}
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
      {(selectedGroupChat || selectedProfileIds.length > 0) && (
        <ChatContent
          chatId={selectedGroupChat}
          profiles={selectedProfiles}
          inModalView={true}
        />
      )}
    </div>
  );
}
