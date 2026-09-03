'use client';
import { Button, CancelButton } from '@/components/button/button';
import { TextFieldGroup } from '@/components/FieldGroup';
import { ImageUpload } from '@/components/ImageUpload';
import { FullscreenModal } from '@/components/modal/FullscreenModal';
import { Modal } from '@/components/modal/Modal';
import { useModalContext } from '@/context/ModalContext';
import { useToast } from '@/context/Toast/ToastContext';
import { useTRPC } from '@/lib/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileDTO, ProfilePageDTO, UpdateProfileInput } from '@repo/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import * as R from 'remeda';

export function UpdateProfileModal({ profile }: { profile: ProfilePageDTO }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { closeModal } = useModalContext();
  const { addToast } = useToast();

  const defaultValues = useMemo(
    () =>
      ProfileDTO.omit({ id: true, createdAt: true, updatedAt: true }).parse(
        profile
      ),
    [profile]
  );

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(
      ProfileDTO.omit({ id: true, createdAt: true, updatedAt: true })
    ),
    defaultValues,
    mode: 'onBlur',
  });
  const { isDirty } = useFormState({ control });
  const { dirtyFields } = formState;

  const { mutateAsync: updateProfile, isPending } = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: (updatedProfile) => {
        const profileQueryKey = trpc.profile.byId.queryKey({
          profileId: profile.id,
        });
        const oldData = queryClient.getQueryData(profileQueryKey);

        if (oldData) {
          queryClient.setQueryData(profileQueryKey, {
            ...oldData,
            ...updatedProfile,
          });
        }

        addToast({
          header: 'Success',
          body: 'Profile updated successfully!',
          variant: 'success',
        });
      },
      onError: (error) => {
        addToast({
          header: 'Error',
          body:
            error.message ||
            'Failed to update profile, please try again later.',
          variant: 'danger',
        });
      },
    })
  );

  const onSubmit = async (data: Omit<UpdateProfileInput, 'id'>) => {
    try {
      const dirtyFieldKeys = R.keys(dirtyFields);
      const updatedFields = R.pick(data, dirtyFieldKeys);
      console.log({ updatedFields }, 'sending updates');
      await updateProfile({ id: profile.id, ...updatedFields });
      closeModal();
    } catch (error) {
      console.error(error, 'Failed to update profile.');
    }
  };

  return (
    <FullscreenModal header="Update Profile">
      <form
        className="flex flex-col p-4 justify-center items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <TextFieldGroup
            type="text"
            label="First Name"
            name="firstName"
            control={control}
          />

          <TextFieldGroup
            type="text"
            label="Last Name"
            name="lastName"
            control={control}
          />

          <ImageUpload
            label="Profile Picture"
            name="avatarUrl"
            control={control}
          />

          <ImageUpload
            label="Header Image"
            name="headerUrl"
            control={control}
          />

          <TextFieldGroup
            type="text"
            as="textarea"
            label="Title"
            name="title"
            control={control}
            placeholder="Add a title"
            helperText="Max 50 characters"
          />

          <TextFieldGroup
            type="text"
            as="textarea"
            label="Bio"
            name="bio"
            control={control}
            placeholder="Tell us about yourself"
            helperText="Max 250 characters"
          />
        </div>
        <Button type="submit" disabled={isPending || !isDirty} className="">
          Save
        </Button>
      </form>
    </FullscreenModal>
  );
}

interface CancelRequestModalProps {
  onCancelRequest: () => void;
}

export function CancelRequestModal({
  onCancelRequest,
}: CancelRequestModalProps) {
  return (
    <Modal header="Cancel Request?">
      <p>Click to cancel friend request.</p>
      <div className="flex gap-2 mt-4 justify-end">
        <CancelButton key="close" />
        <Button
          key="cancel-request"
          onClick={onCancelRequest}
          className="bg-red-500 text-white"
        >
          Cancel Friend Request
        </Button>
      </div>
    </Modal>
  );
}

interface RemoveFriendModalProps {
  onConfirmRemoveFriend: () => void;
}

export function RemoveFriendModal({
  onConfirmRemoveFriend,
}: RemoveFriendModalProps) {
  return (
    <Modal header="Remove Friend?">
      <p>This person will be removed from your friends list.</p>
      <div className="flex gap-2 mt-4 justify-end">
        <CancelButton key="close" />
        <Button
          key="remove-friend"
          onClick={onConfirmRemoveFriend}
          className="bg-red-500 text-white"
        >
          Remove Friend
        </Button>
      </div>
    </Modal>
  );
}
