'use client';
import { Modal } from '@/components/modal/Modal';
import { useModalContext } from '@/context/ModalContext';
import { useToast } from '@/context/Toast/ToastContext';
import { useTRPC } from '@/lib/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfilePageDTO, UpdateProfileInput } from '@repo/common';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { TextFieldGroup } from '@/components/FieldGroup';
import { ImageUpload } from '@/components/ImageUpload';

export function UpdateProfileModal({ profile }: { profile: ProfilePageDTO }) {
  const trpc = useTRPC();
  const router = useRouter();
  const { closeModal } = useModalContext();
  const { addToast } = useToast();

  const defaultValues = useMemo(
    () => UpdateProfileInput.parse(profile),
    [profile]
  );

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(UpdateProfileInput),
    defaultValues,
    mode: 'onBlur',
  });

  const { mutateAsync: updateProfile, isPending } = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: () => {
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

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      await updateProfile(data);
      closeModal();
    } catch (error) {
      console.error(error, 'Failed to update profile.');
    }
  };

  return (
    <Modal header="Update Profile">
      <form onSubmit={handleSubmit(onSubmit)}>
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
            label="Bio"
            name="bio"
            control={control}
            placeholder="Tell us about yourself"
            helperText="Max 250 characters"
          />
        </div>
        <button disabled={isPending}>Done</button>
      </form>
    </Modal>
  );
}
