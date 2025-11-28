'use client';
import { CreateProfileInput } from '@repo/common';
import { ImageUpload } from '@/components/ImageUpload';
import { TextFieldGroup } from '@/components/FieldGroup';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';
import { useToast } from '@/context/ToastContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function CreateProfile() {
  const trpc = useTRPC();
  const router = useRouter();
  const { addToast } = useToast();

  const defaultValues = useMemo(() => CreateProfileInput.parse({}), []);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(CreateProfileInput),
    defaultValues,
    mode: 'onBlur',
  });

  const { mutateAsync: createProfile, isPending } = useMutation(
    trpc.profile.create.mutationOptions({
      onSuccess: () => {
        addToast({
          header: 'Success',
          body: 'Profile created successfully!',
          variant: 'success',
        });
        router.push('/chats');
      },
      onError: (error) => {
        addToast({
          header: 'Error',
          body:
            error.message ||
            'Failed to create profile, please try again later.',
          variant: 'danger',
        });
      },
    })
  );

  const onSubmit = async (data: CreateProfileInput) => {
    try {
      await createProfile(data);
      router.push('/profile');
    } catch (error) {
      console.error(error, 'Failed to create profile.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Create your profile here!</h1>

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

        <ImageUpload label="Header Image" name="headerUrl" control={control} />

        <TextFieldGroup
          type="text"
          as="textarea"
          label="Bio"
          name="bio"
          control={control}
          placeholder="Tell us about yourself"
          helperText="Max 200 characters"
        />
      </div>
      <button disabled={isPending}>Done</button>
    </form>
  );
}
