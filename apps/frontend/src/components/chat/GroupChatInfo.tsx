import { useAuth } from '@/context/AuthContext';
import { useToggle } from '@/hooks/general';
import { getChatDisplayName, getProfileDisplayName } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseProfileDTO, ObjectId, UpdateChatInput } from '@repo/common';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import {
  Control,
  SubmitHandler,
  useForm,
  useFormState,
  UseFormHandleSubmit,
} from 'react-hook-form';
import { useModalContext } from '@/context/ModalContext';
import { useChatInfo } from '@/hooks/chat';
import * as R from 'remeda';
import { Button, CancelButton } from '../button/button';
import { TextFieldGroup } from '../FieldGroup';
import { GroupPhoto } from '../GroupPhoto';
import { ImageUpload } from '../ImageUpload';
import LoadingSpinner from '../LoadingSpinner';
import { Modal } from '../modal/Modal';
import { ProfilePreview } from '../profile/ProfilePreview';
import { Contacts } from '../Contacts';
import { FullscreenModal } from '../modal/FullscreenModal';
import { getParticipantProfiles } from '@/utils/general';
import { useNavigation } from '@/utils/Navigation';

interface PhotoModalContentProps {
  control: Control<Omit<UpdateChatInput, 'id'>>;
  handleSubmit: UseFormHandleSubmit<Omit<UpdateChatInput, 'id'>>;
  onSubmit: SubmitHandler<Omit<UpdateChatInput, 'id'>>;
}

function PhotoModalContent(props: PhotoModalContentProps) {
  const { control, handleSubmit, onSubmit } = props;
  const { isDirty } = useFormState({ control });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { closeModal } = useModalContext();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ImageUpload
        name="groupPictureUrl"
        control={control}
        imageClassName="rounded-full object-cover"
        imageSize={100}
        onUploadingChange={setIsUploadingPhoto}
      />
      <Button
        type="submit"
        onClick={closeModal}
        disabled={isUploadingPhoto || !isDirty}
      >
        {isUploadingPhoto ? <LoadingSpinner /> : 'Confirm'}
      </Button>
    </form>
  );
}

interface GroupChatInfoProps {
  chatId: ObjectId;
  onScrollToBottom: () => void;
}

export function GroupChatInfo(props: GroupChatInfoProps) {
  const { chatId, onScrollToBottom } = props;
  const {
    status: editMode,
    toggleStatus: toggleEditMode,
    setStatus: setEditMode,
  } = useToggle();
  const { launchModal, closeModal } = useModalContext();
  const { profile } = useAuth();
  const { navigateToProfile } = useNavigation();

  const {
    chat,
    isLoading,
    updateChat,
    isUpdatingChatInfo,
    addMember,
    removeMember,
    leaveChat,
  } = useChatInfo({ chatId });

  const defaultValues = useMemo(
    () => (chat ? UpdateChatInput.omit({ id: true }).parse(chat) : undefined),
    [chat]
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { dirtyFields },
  } = useForm({
    resolver: zodResolver(UpdateChatInput.omit({ id: true })),
    defaultValues,
    mode: 'onBlur',
  });

  const groupPictureFormValue = watch('groupPictureUrl');
  const isDisplayNameDirty = Boolean(dirtyFields.name);

  // reset when chat data loads or changes
  useEffect(() => {
    if (chat) {
      reset(UpdateChatInput.omit({ id: true }).parse(chat));
    }
  }, [chat, reset]);

  const onSubmit = async (data: Omit<UpdateChatInput, 'id'>) => {
    if (!chatId) return;
    try {
      const dirtyFieldKeys = R.keys(dirtyFields);
      const updatedFields = R.pick(data, dirtyFieldKeys);
      const updatedChat = await updateChat({ id: chatId, ...updatedFields });

      // Reset form with updated values
      reset(UpdateChatInput.omit({ id: true }).parse(updatedChat));
      setEditMode(false);
    } catch (error) {
      console.error(error, 'Failed to update chat.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!chat) return null;

  const { name, participants, groupPictureUrl } = chat;

  const participantProfiles = getParticipantProfiles(participants);

  const displayName = getChatDisplayName({
    name,
    participantProfiles,
    profileId: profile?.id,
  });

  const handleMutationSuccess = () => {
    closeModal();
    window.requestAnimationFrame(() => {
      onScrollToBottom();
    });
  };

  const handleLaunchRemoveMemberModal = (profileId: ObjectId) => {
    const profile = participants.find(
      (p) => p.profile.id === profileId
    )?.profile;

    if (!profile) {
      console.error('Profile not found');
      return;
    }

    launchModal(
      <Modal header="Remove Member">
        <p>Remove {getProfileDisplayName(profile)} from the chat?</p>
        <div className="flex gap-2 mt-4 justify-center">
          <CancelButton key="close" />
          <Button
            key="cancel-request"
            type="button"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              removeMember(
                { chatId, profileId },
                {
                  onSuccess: handleMutationSuccess,
                }
              );
            }}
            className="bg-red-500 text-white"
          >
            Remove
          </Button>
        </div>
      </Modal>
    );
  };

  const handleLaunchPhotoModal = () => {
    launchModal(
      <Modal>
        <PhotoModalContent
          control={control}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
        />
      </Modal>
    );
  };

  const handleLaunchContactsModal = () => {
    const participantIds = participants.map((p) => p.profile.id);
    launchModal(
      <FullscreenModal header="Add Member">
        <Contacts
          onSelectProfile={(profile) => {
            handleLaunchAddMemberConfirmModal(profile);
          }}
          profilesToExclude={participantIds}
        />
      </FullscreenModal>
    );
  };

  const handleLaunchAddMemberConfirmModal = (profile: BaseProfileDTO) => {
    const displayName = getProfileDisplayName(profile);
    closeModal(); // Close contacts modal
    launchModal(
      <Modal header={`Add ${displayName} to chat?`}>
        <div className="flex gap-2 mt-4 justify-end">
          {/* TODO: abstract this further? */}
          <CancelButton key="close" />
          <Button
            key="add-member"
            type="button"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              addMember(
                { chatId, profileId: profile.id },
                {
                  onSuccess: handleMutationSuccess,
                }
              );
            }}
            className="bg-green-500 text-white"
          >
            Add
          </Button>
        </div>
      </Modal>
    );
  };

  const handleLaunchLeaveChatModal = () => {
    launchModal(
      <Modal header="Leave chat?">
        <p className="text-sm text-gray-700">
          Are you sure you want to leave {displayName}?
        </p>
        <div className="flex gap-2 mt-4 justify-end">
          <CancelButton key="close" />
          <Button
            key="leave-chat"
            type="button"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              leaveChat({ chatId });
              closeModal();
              window.location.href = '/chats';
            }}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Leave Chat
          </Button>
        </div>
      </Modal>
    );
  };

  const handleProfilePreviewClick = (profileId: ObjectId) => {
    navigateToProfile(profileId);
  };

  const handleEditModeButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    toggleEditMode();
  };

  return (
    <div className="group-chat-info-container relative flex flex-col gap-3 mt-1">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="chat-photo-name-form relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-grey-150 bg-gradient-to-b from-white to-brand-accent p-4 shadow-sm md:p-5"
      >
        <div
          onClick={handleLaunchPhotoModal}
          className="rounded-full p-1 transition-colors hover:bg-brand-light"
        >
          <GroupPhoto
            groupPictureUrl={groupPictureFormValue || groupPictureUrl}
            participantProfiles={participantProfiles}
            size={80}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>

        <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-grey-150 bg-white/80 px-3 py-2">
          <div className="w-[40px]"></div>
          {editMode ? (
            <>
              <TextFieldGroup
                type="text"
                name="name"
                control={control}
                limit={50}
              />
            </>
          ) : (
            <>
              <h1 className="max-w-[60%] break-word text-center text-2xl text-brand-dark">
                {displayName}
              </h1>
            </>
          )}

          {editMode && isDisplayNameDirty ? (
            <Button
              type="submit"
              disabled={isUpdatingChatInfo}
              className="self-start border-brand bg-brand text-white hover:bg-blue-700 h-[35px] w-[35px] flex items-center justify-center rounded-full"
            >
              <i className="bi bi-floppy text-sm" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleEditModeButtonClick}
              className="self-start border-grey-200 bg-white px-3 py-1 text-slate-700 hover:bg-grey-100 h-[35px] w-[35px] flex items-center justify-center rounded-full"
              aria-label={editMode ? 'Cancel edit' : 'Edit chat name'}
            >
              <i
                className={
                  editMode ? 'bi bi-x-lg text-sm' : 'bi bi-pencil text-sm'
                }
              />
            </Button>
          )}
        </div>
      </form>

      <div className="members-container rounded-2xl border border-grey-150 bg-white/90 p-4 shadow-sm md:p-5">
        <h3 className="mb-3 text-lg font-semibold text-brand-dark">Members</h3>
        <div className="flex flex-col gap-3">
          {participants.map((p) => {
            if (p.profile.id === profile?.id) return;
            return (
              <ProfilePreview
                key={p.profile.id}
                profile={p.profile}
                showPresence={true}
                onClick={() => handleProfilePreviewClick(p.profile.id)}
                className="rounded-xl border-grey-150 bg-white/80 px-3 py-2 transition-colors hover:bg-grey-50"
                rightContent={
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLaunchRemoveMemberModal(p.profile.id);
                    }}
                    className="opacity-100 cursor-pointer md:opacity-0 md:group-hover:opacity-100 md:transition-opacity text-red-500 hover:text-red-700 py-2 px-2"
                    aria-label="Remove member"
                  >
                    <i className="bi bi-x-circle text-xl py-2 px-2" />
                  </Button>
                }
              />
            );
          })}

          <div className="mt-1 flex flex-col gap-3 border-t border-grey-150 pt-4">
            <Button
              type="button"
              onClick={handleLaunchContactsModal}
              className="border-brand bg-brand text-white hover:bg-blue-700"
            >
              Add Member
            </Button>
            <Button
              type="button"
              onClick={handleLaunchLeaveChatModal}
              className="border-red-500 bg-red-500 text-white hover:bg-red-600"
            >
              Leave Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
