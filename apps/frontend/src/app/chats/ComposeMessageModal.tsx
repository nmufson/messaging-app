'use client';

import { ChatContent } from '@/components/chat/ChatContent';
import { ChatResultItem } from '@/components/chats/ChatResultItem';
import { SelectedProfilesInput } from '@/components/chats/SelectedProfilesInput';
import { ProfileResultItem } from '@/components/profile/ProfileResultItem';
import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { useInput, useSelectedValue, useSelectedValues } from '@/hooks/general';
import { SelectedProfile } from '@/types/profile';
import { BaseProfileDTO, ObjectId } from '@repo/common';
import { useMemo } from 'react';

interface ComposeMessageModalProps {
  initialSelectedProfiles?: SelectedProfile[];
  shouldFocusChatInput?: boolean;
}

export function ComposeMessageModal(props: ComposeMessageModalProps) {
  const { initialSelectedProfiles = [], shouldFocusChatInput = false } = props;
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
  } = useSelectedValues<SelectedProfile>(initialSelectedProfiles);
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

  const handleProfileClick = (profile: BaseProfileDTO) => {
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
    <div className="space-y-5 rounded-3xl bg-white p-4 text-slate-900 sm:p-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="h-10 w-10" />
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          New Message
        </h1>
        <button
          type="button"
          onClick={closeModal}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
      <form className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label htmlFor="chat-for" className="font-medium text-slate-700">
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
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand transition hover:bg-brand hover:text-white"
        >
          <i className="bi bi-plus-circle" />
        </button>
      </form>

      {groupChats.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Chats
            </h4>
          </div>
          <div className="flex flex-col gap-2">
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
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Friends
            </h4>
          </div>
          <div className="flex flex-col gap-2">
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
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <ChatContent
            chatId={selectedGroupChat}
            profiles={selectedProfiles}
            inModalView={true}
            isComposeMessageView={true}
            shouldFocusChatInput={shouldFocusChatInput}
          />
        </div>
      )}
    </div>
  );
}
