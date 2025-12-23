'use client';

import { ChatContent } from '@/components/chat/ChatContent';
import { ChatResultItem } from '@/components/chats/ChatResultItem';
import { SelectedProfilesInput } from '@/components/chats/SelectedProfilesInput';
import { ProfileResultItem } from '@/components/profile/ProfileResultItem';
import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { useInput, useSelectedValue, useSelectedValues } from '@/hooks/general';
import { ListProfileDTO, ObjectId } from '@repo/common';
import { useMemo } from 'react';

// TODO make friends list content, with both page and modal view

export interface SelectedProfile {
  id: ObjectId;
  firstName: string;
  lastName: string;
}

export function WriteToChatModal() {
  const { closeModal } = useModalContext();
  const {
    value: searchNameInput,
    setValue: setSearchNameInput,
    onChange: onSearchNameInputChange,
  } = useInput();

  const {
    values: selectedProfiles,
    add: addSelectedProfile,
    remove: removeSelectedProfile,
    clear: clearSelectedProfiles,
  } = useSelectedValues<SelectedProfile>([]);
  const { value: selectedGroupChat, onChange: onSelectedGroupChatChange } =
    useSelectedValue<ObjectId | null>(null);
  const {
    value: highlightedProfileId,
    onChange: onHighlightedProfileIdChange,
  } = useSelectedValue<ObjectId | null>(null);

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

    addSelectedProfile(profileWithoutAvatar);
    setSearchNameInput('');
    onHighlightedProfileIdChange(null);
  };

  const handleClearSelections = () => {
    onSelectedGroupChatChange(null);
    clearSelectedProfiles();
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
          onHighlightedProfileIdChange={onHighlightedProfileIdChange}
          removeSelectedProfile={removeSelectedProfile}
          searchNameInput={searchNameInput}
          onSearchNameInputChange={onSearchNameInputChange}
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
                onSelectChat={onSelectedGroupChatChange}
                onClearSelections={handleClearSelections}
                addSelectedProfile={addSelectedProfile}
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
