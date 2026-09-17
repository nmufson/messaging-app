'use client';
import { TextFieldGroup } from '@/components/FieldGroup';
import { ImageUpload } from '@/components/ImageUpload';
import { useToast } from '@/context/Toast/ToastContext';
import { useTRPC } from '@/lib/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProfileInput } from '@repo/common';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

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
    <div className="h-screen overflow-y-auto px-4 py-6 bg-brand-accent">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6"
      >
        {/* Form Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Create Profile</h2>
          <p className="text-sm text-slate-500">
            Add details for your public profile.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Name Fields: Side-by-Side on small screens and up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Media Upload Section */}
          <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
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
          </div>

          {/* Text Area Fields */}
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

        {/* Form Footer / Action */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : 'Done'}
          </button>
        </div>
      </form>
    </div>
  );
}
