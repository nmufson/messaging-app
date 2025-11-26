'use client';
import { CreateProfileInput, z } from '@repo/common';
import { ImageUpload } from '@/components/ImageUpload';
import { InputGroup, FieldConfig } from '@/components/InputGroup';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';
import { useToast } from '@/context/ToastContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

// const INITIAL_FORM: z.infer<typeof CreateProfileInput> = {
//   firstName: '',
//   lastName: '',
//   avatarUrl: '',
//   headerUrl: '',
//   bio: '',
// };

export default function CreateProfile() {
  const trpc = useTRPC();
  const router = useRouter();
  const { addToast } = useToast();

  const defaultValues = useMemo(() => CreateProfileInput.parse({}), []);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
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
      },
      onError: (error) => {
        addToast({
          header: 'Error',
          body: error.message || 'Failed to create profile.',
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
        {/* <ImageUpload
          label={'Profile Picture'}
          value={value || ''}
          onChange={onChange}
          error={errors[field.name]?.message}
          onError={(msg) =>
            setError(field.name, { type: 'custom', message: msg })
          }
          required={field.required}
        />

        <InputGroup<z.infer<typeof CreateProfileInput>>
          type={field.type}
          label={field.label}
          name={field.name}
          value={value || ''}
          onChange={(name, val) => onChange(val)}
          error={errors[field.name]?.message}
          placeholder={field.placeholder}
          required={field.required}
          maxLength={field.maxLength}
        /> */}
      </div>
      <button disabled={isPending}>Done</button>
    </form>
  );
}
