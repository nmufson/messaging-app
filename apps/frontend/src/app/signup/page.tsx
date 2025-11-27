'use client';
import { useToast } from '@/context/ToastContext';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo } from 'react';
import { useTRPC } from '../../lib/trpc';
import { CreateUserInput } from '@repo/common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextFieldGroup } from '@/components/InputGroup';

export default function SignUp() {
  const trpc = useTRPC();
  const router = useRouter();
  const { addToast } = useToast();

  const defaultValues = useMemo(() => CreateUserInput.parse({}), []);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(CreateUserInput),
    defaultValues,
    mode: 'onBlur',
  });

  const {
    mutateAsync: registerUser,
    isPending,
    error,
  } = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: () => {
        addToast({
          header: 'Success',
          body: 'User registered successfully!',
          variant: 'success',
        });
      },
      onError: (error) => {
        addToast({
          header: 'Error',
          body: error.message || 'Failed to register, please try again later.',
          variant: 'danger',
        });
      },
    })
  );

  const onSubmit = async (data: CreateUserInput) => {
    try {
      await registerUser(data);
      router.push('/create-profile');
    } catch (error) {
      console.error(error, 'Failed to register user.');
    }
  };

  return (
    <div className="bg-black-500">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Register Below!</h1>
        <div>
          <TextFieldGroup
            type="email"
            label="Email"
            name="email"
            control={control}
          />
          <TextFieldGroup
            type="password"
            label="Password"
            name="password"
            control={control}
          />
          <TextFieldGroup
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            control={control}
          />
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
