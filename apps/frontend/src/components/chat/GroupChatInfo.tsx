import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/Toast/ToastContext';
import { useToggle } from '@/hooks/general';
import { useTRPC } from '@/lib/trpc';
import { getChatDisplayName, getProfileDisplayName } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChatDTO, ObjectId, UpdateChatInput } from '@repo/common';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { MouseEvent, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import * as R from 'remeda';
import { TextFieldGroup } from '../FieldGroup';
import { GroupPhoto } from '../GroupPhoto';
import { ProfilePreview } from '../profile/ProfilePreview';
import { ImageUpload } from '../ImageUpload';
import { Button, CancelButton } from '../button/button';
import LoadingSpinner from '../LoadingSpinner';
import { useModalContext } from '@/context/ModalContext';
import { Modal, ModalActions } from '../modal/Modal';
import { useChatInfo } from '@/hooks/chat';

export function GroupChatInfo({ chatId }: { chatId: ObjectId }) {
  const {
    status: editMode,
    toggleStatus: toggleEditMode,
    setStatus: setEditMode,
  } = useToggle();
  const { launchModal } = useModalContext();
  const { profile } = useAuth();

  const { chat, isLoading, updateChat, isPending } = useChatInfo({ chatId });

  const defaultValues = useMemo(
    () => (chat ? UpdateChatInput.omit({ id: true }).parse(chat) : undefined),
    [chat]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isDirty },
  } = useForm({
    resolver: zodResolver(UpdateChatInput.omit({ id: true })),
    defaultValues,
    mode: 'onBlur',
  });

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

  const displayName = getChatDisplayName({
    name,
    participants,
    profileId: profile?.id,
  });

  const handleLaunchRemoveMemberModal = (profileId: ObjectId) => {
    console.log('launching');
    const profile = participants.find((p) => p.id === profileId);
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
            onClick={() => {}}
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <ImageUpload
            name="groupPictureUrl"
            control={control}
            imageClassName="rounded-full object-cover"
            imageSize={100}
          />
          <Button type="submit" disabled={isPending || !isDirty}>
            <i className="bi bi-floppy" />
          </Button>
        </form>
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
            groupPictureUrl={groupPictureUrl}
            participants={participants}
            size={100}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>

        <div className="flex justify-between items-center gap-2 px-4">
          <div></div>
          {editMode ? (
            <>
              <TextFieldGroup type="text" name="name" control={control} />
              <Button type="submit" disabled={isPending}>
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
              key={p.id}
              profile={p}
              showPresence={true}
              rightContent={
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLaunchRemoveMemberModal(p.id);
                  }}
                  className="opacity-100 cursor-pointer md:opacity-0 md:group-hover:opacity-100 md:transition-opacity text-red-500 hover:text-red-700 p-2"
                  aria-label="Remove member"
                >
                  <i className="bi bi-x-circle text-xl" />
                </Button>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
