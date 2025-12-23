'use client';
import { TextFieldGroup } from '@/components/FieldGroup';
import { useToast } from '@/context/Toast/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserInput } from '@repo/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTRPC } from '../../lib/trpc';

export default function SignUp() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const defaultValues = useMemo(() => CreateUserInput.parse({}), []);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(CreateUserInput),
    defaultValues,
    mode: 'onBlur',
  });

  const { mutateAsync: registerUser } = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: (data) => {
        addToast({
          header: 'Success',
          body: 'User registered successfully!',
          variant: 'success',
        });
        // Set auth data immediately
        queryClient.setQueryData(trpc.auth.me.queryKey(), data);
        // Force full reload to reconnect WebSocket with new session
        window.location.href = '/create-profile';
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
    } catch (error) {
      console.error(error, 'Failed to register user.');
    }
  };

  return (
    <form className="bg-black-500" onSubmit={handleSubmit(onSubmit)}>
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

      <div>
        <button type="submit">Sign Up</button>
        <div className="flex gap-2 items-center ">
          <small className="text-sm">Already registered?</small>
          <Link className="text-sm" href={'/login'}>
            Log In
          </Link>
        </div>
      </div>
    </form>
  );
}
