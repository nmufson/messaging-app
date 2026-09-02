'use client';

import { ChatContent } from '@/components/chat/ChatContent';
import { ChatResultItem } from '@/components/chats/ChatResultItem';
import { SelectedProfilesInput } from '@/components/chats/SelectedProfilesInput';
import { ProfileResultItem } from '@/components/profile/ProfileResultItem';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { getChatDisplayName } from '@/utils';
import { getParticipantProfiles } from '@/utils/general';
import { useInput, useSelectedValue, useSelectedValues } from '@/hooks/general';
import { SelectedProfile } from '@/types/profile';
import { BaseProfileDTO, ChatListItemDTO, ObjectId } from '@repo/common';
import { ChangeEvent, useMemo } from 'react';
import * as R from 'remeda';

interface ComposeMessageModalProps {
  initialSelectedProfiles?: SelectedProfile[];
  shouldFocusChatInput?: boolean;
}

interface SelectedGroupChat {
  id: ObjectId;
  label: string;
}

export function ComposeMessageModal(props: ComposeMessageModalProps) {
  const { initialSelectedProfiles = [], shouldFocusChatInput = false } = props;
  const { closeModal } = useModalContext();
  const { profile } = useAuth();
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

  const {
    value: selectedGroupChat,
    handleChange: handleSelectedGroupChatChange,
  } = useSelectedValue<SelectedGroupChat | null>(null);

  const {
    value: highlightedProfileId,
    handleChange: handleHighlightedProfileIdChange,
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

  const hasChatTarget = R.isTruthy(
    selectedGroupChat || selectedProfileIds.length
  );
  const shouldShowSearchResults = groupChats.length > 0 || profiles.length > 0;

  const handleProfileSelect = (profile: BaseProfileDTO) => {
    const profileSelection: SelectedProfile = {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
    };

    handleSelectedGroupChatChange(null);
    addSelectedProfile(profileSelection);
    setSearchNameInput('');
    handleHighlightedProfileIdChange(null);
  };

  const handleGroupChatSelect = (chat: ChatListItemDTO) => {
    const participantProfiles = getParticipantProfiles(chat.participants);
    const chatDisplayName = getChatDisplayName({
      name: chat.name,
      participantProfiles,
      profileId: profile?.id,
    });

    setSearchNameInput('');
    handleSelectedGroupChatChange({ id: chat.id, label: chatDisplayName });
    clearSelectedProfiles();
    handleHighlightedProfileIdChange(null);
  };

  const handleSearchNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchNameInputChange(e);
  };

  const handleClearSelectedGroupChat = () => {
    handleSelectedGroupChatChange(null);
  };

  return (
    <div className="rounded-3xl bg-white px-2 py-4 text-slate-900 overflow-hidden sm:p-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
        <div className="h-10 w-10" />
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          New Message
        </h1>
        <button
          type="button"
          onClick={closeModal}
          className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>

      <div className={hasChatTarget ? 'relative h-[90vh]' : 'relative'}>
        {hasChatTarget && (
          <div className="absolute inset-x-0 bottom-0 top-13 z-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:top-16 sm:p-4">
            <ChatContent
              chatId={selectedGroupChat?.id ?? null}
              profiles={selectedProfiles}
              inModalView={true}
              isComposeMessageView={true}
              shouldFocusChatInput={shouldFocusChatInput}
            />
          </div>
        )}

        <div className="relative z-20">
          <form className="mb-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-1">
            <label htmlFor="chat-for" className="text-lg text-slate-700">
              For:
            </label>
            <SelectedProfilesInput
              selectedProfiles={selectedProfiles}
              selectedGroupChatName={selectedGroupChat?.label}
              highlightedProfileId={highlightedProfileId}
              onHighlightedProfileIdChange={handleHighlightedProfileIdChange}
              removeSelectedProfile={removeSelectedProfile}
              searchNameInput={searchNameInput}
              onSearchNameInputChange={handleSearchNameInputChange}
              onClearSelectedGroupChat={handleClearSelectedGroupChat}
            />
          </form>

          {shouldShowSearchResults && (
            <div className="max-h-[45vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              {groupChats.length > 0 && (
                <div className="flex flex-col gap-1">
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
                        onSelectChat={handleGroupChatSelect}
                        onSelectProfile={handleProfileSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {profiles.length > 0 && (
                <div
                  className={`flex flex-col gap-1 ${groupChats.length > 0 ? 'mt-3' : ''}`}
                >
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
                        onAddProfile={handleProfileSelect}
                        className="cursor-pointer p-2 border-grey-200 border-b rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
