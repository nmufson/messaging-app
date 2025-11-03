import { ObjectId } from '@repo/common';
import { SelectedProfile } from '@/app/chats/WriteToChatModal';
import { useEffect, useRef } from 'react';

interface SelectedProfilesInputProps {
  selectedProfiles: SelectedProfile[];
  highlightedProfileId: ObjectId | null;
  setHighlightedProfileId: (id: ObjectId | null) => void;
  setSelectedProfiles: (profiles: SelectedProfile[]) => void;
  searchNameInput: string;
  setSearchNameInput: (val: string) => void;
}

export function SelectedProfilesInput(props: SelectedProfilesInputProps) {
  const {
    selectedProfiles,
    highlightedProfileId,
    setHighlightedProfileId,
    setSelectedProfiles,
    searchNameInput,
    setSearchNameInput,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchNameInput(e.target.value);
    if (highlightedProfileId) setHighlightedProfileId(null);
  }

  const handleProfileItemKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    profile: SelectedProfile
  ) => {
    e.preventDefault();

    if (highlightedProfileId === profile.id && e.key === 'Backspace') {
      setSelectedProfiles(selectedProfiles.filter((p) => p.id !== profile.id));
      setHighlightedProfileId(null);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedProfiles]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Backspace' &&
      searchNameInput === '' &&
      selectedProfiles.length > 0
    ) {
      setHighlightedProfileId(selectedProfiles[selectedProfiles.length - 1].id);
    }
  };

  // TODO: can prob make this a component
  return (
    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
      {selectedProfiles.map((profile) => (
        <span
          key={profile.id}
          tabIndex={0}
          onClick={() => setHighlightedProfileId(profile.id)}
          onBlur={() => setHighlightedProfileId(null)}
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
        className="px-2 py-1 border-none focus:outline-none min-w-[120px] flex-shrink"
        style={{ flexBasis: '120px' }}
        ref={inputRef}
        onKeyDown={handleInputKeyDown}
      />
    </div>
  );
}
