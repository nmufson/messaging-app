import { SelectedProfile } from '@/types/profile';
import { ObjectId } from '@repo/common';

import { ChangeEvent, useEffect, useRef } from 'react';
import { KeyboardEvent } from 'react';

interface SelectedProfilesInputProps {
  selectedProfiles: SelectedProfile[];
  selectedGroupChatName?: string | null;
  onClearSelectedGroupChat?: () => void;
  highlightedProfileId: ObjectId | null;
  onHighlightedProfileIdChange: (id: ObjectId | null) => void;
  removeSelectedProfile: (profile: SelectedProfile) => void;
  searchNameInput: string;
  onSearchNameInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function SelectedProfilesInput(props: SelectedProfilesInputProps) {
  const {
    selectedProfiles,
    selectedGroupChatName,
    onClearSelectedGroupChat,
    highlightedProfileId,
    onHighlightedProfileIdChange,
    removeSelectedProfile,
    searchNameInput,
    onSearchNameInputChange,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChangeSearch(e: ChangeEvent<HTMLInputElement>) {
    onSearchNameInputChange(e);
    if (highlightedProfileId) onHighlightedProfileIdChange(null);
  }

  const handleProfileItemKeyDown = (
    e: KeyboardEvent<HTMLSpanElement>,
    profile: SelectedProfile
  ) => {
    e.preventDefault();
    if (highlightedProfileId === profile.id && e.key === 'Backspace') {
      removeSelectedProfile(profile);
      onHighlightedProfileIdChange(null);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedProfiles, selectedGroupChatName]);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace' || searchNameInput !== '') return;

    if (selectedProfiles.length === 0) {
      if (selectedGroupChatName) {
        onClearSelectedGroupChat?.();
      }
      return;
    }

    if (highlightedProfileId) {
      const profileToRemove = selectedProfiles.find(
        (p) => p.id === highlightedProfileId
      );
      if (profileToRemove) {
        removeSelectedProfile(profileToRemove);
      }
      onHighlightedProfileIdChange(null);
      return;
    }

    const lastProfile = selectedProfiles[selectedProfiles.length - 1];
    onHighlightedProfileIdChange(lastProfile.id);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 flex-1">
      {selectedGroupChatName && (
        <span className="px-2 py-1 bg-gray-100 rounded-full text-sm whitespace-nowrap">
          {selectedGroupChatName}
        </span>
      )}
      {selectedProfiles.map((profile) => (
        <span
          key={profile.id}
          tabIndex={0}
          onClick={() => onHighlightedProfileIdChange(profile.id)}
          onBlur={() => onHighlightedProfileIdChange(null)}
          className={`px-2 py-1 bg-gray-100 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${highlightedProfileId === profile.id ? 'ring-2 ring-brand bg-brand-light text-brand-dark' : ''}`}
          onKeyDown={(e) => handleProfileItemKeyDown(e, profile)}
        >
          {`${profile.firstName} ${profile.lastName}`}
        </span>
      ))}
      <input
        id="chat-for"
        onChange={handleChangeSearch}
        value={searchNameInput}
        autoFocus
        className="px-2 py-1 border-none focus:outline-none flex-1 w-0 min-w-[40px]"
        ref={inputRef}
        onKeyDown={handleInputKeyDown}
      />
    </div>
  );
}
