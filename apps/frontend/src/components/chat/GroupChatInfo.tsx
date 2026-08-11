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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ImageUpload
        name="groupPictureUrl"
        control={control}
        imageClassName="rounded-full object-cover"
        imageSize={100}
        onUploadingChange={setIsUploadingPhoto}
      />
      <Button type="submit" disabled={isUploadingPhoto || !isDirty}>
        {true ? <LoadingSpinner /> : 'Confirm'}
      </Button>
    </form>
  );
}

export function GroupChatInfo({ chatId }: { chatId: ObjectId }) {
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
            onClick={() => {
              removeMember({ chatId, profileId });
              closeModal();
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
    launchModal(
      <FullscreenModal title="Add Member">
        <Contacts
          onSelectProfile={(profile) => {
            handleLaunchAddMemberConfirmModal(profile);
          }}
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
            onClick={() => {
              addMember({ chatId, profileId: profile.id });
              closeModal();
            }}
            className="bg-green-500 text-white"
          >
            Add
          </Button>
        </ModalActions>
      </Modal>
    );
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

      <div>
        <h3>Members</h3>
        <div>
          {participants.map((p) => (
            <ProfilePreview
              key={p.profile.id}
              profile={p.profile}
              showPresence={true}
              rightContent={
                <Button
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
          ))}
          <Button onClick={handleLaunchContactsModal}>Add Member</Button>
          {/* TODO: button for adding member */}
        </div>
      </div>
    </div>
  );
}
