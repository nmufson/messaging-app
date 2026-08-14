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
import { Modal, ModalActions } from '../modal/Modal';
import { ProfilePreview } from '../profile/ProfilePreview';
import { Contacts } from '../Contacts';
import { FullscreenModal } from '../modal/FullscreenModal';
import { getParticipantProfiles } from '@/utils/general';

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

export function GroupChatInfo({
  chatId,
  onScrollToBottom,
}: {
  chatId: ObjectId;
  onScrollToBottom: () => void;
}) {
  const {
    status: editMode,
    toggleStatus: toggleEditMode,
    setStatus: setEditMode,
  } = useToggle();
  const { launchModal, closeModal } = useModalContext();
  const { profile } = useAuth();

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
        <ModalActions>
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
        </ModalActions>
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
      <FullscreenModal title="Add Member">
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
        <ModalActions>
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
        </ModalActions>
      </Modal>
    );
  };

  const handleLaunchLeaveChatModal = () => {
    launchModal(
      <Modal header="Leave chat?">
        <p className="text-sm text-gray-700">
          Are you sure you want to leave {displayName}?
        </p>
        <ModalActions>
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
        </ModalActions>
      </Modal>
    );
  };

  const handleProfilePreviewClick = (profileId: ObjectId) => {
    window.location.href = `/profile?profileId=${profileId}`;
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center py-5"
      >
        <div onClick={handleLaunchPhotoModal}>
          <GroupPhoto
            groupPictureUrl={groupPictureFormValue || groupPictureUrl}
            participantProfiles={participantProfiles}
            size={100}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>

        <div className="flex justify-between items-center gap-2 px-4">
          <div></div>
          {editMode ? (
            <>
              <TextFieldGroup type="text" name="name" control={control} />
              <Button type="submit" disabled={isUpdatingChatInfo}>
                <i className="bi bi-floppy" />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl">{displayName}</h1>
              <Button
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  toggleEditMode();
                }}
              >
                <i className="bi bi-pencil text-xl" />
              </Button>
            </>
          )}
        </div>
      </form>

      <div className="mt-6">
        <h3 className="mb-3 text-lg font-semibold">Members</h3>
        <div className="space-y-3">
          {participants.map((p) => {
            if (p.profile.id === profile?.id) return;
            return (
              <ProfilePreview
                key={p.profile.id}
                profile={p.profile}
                showPresence={true}
                onClick={() => handleProfilePreviewClick(p.profile.id)}
                rightContent={
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLaunchRemoveMemberModal(p.profile.id);
                    }}
                    className="opacity-100 cursor-pointer md:opacity-0 md:group-hover:opacity-100 md:transition-opacity text-red-500 hover:text-red-700 p-2"
                    aria-label="Remove member"
                  >
                    <i className="bi bi-x-circle text-xl" />
                  </Button>
                }
              />
            );
          })}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              onClick={handleLaunchContactsModal}
              className="bg-sky-600 text-white hover:bg-sky-700"
            >
              Add Member
            </Button>
            <Button
              type="button"
              onClick={handleLaunchLeaveChatModal}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Leave Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
