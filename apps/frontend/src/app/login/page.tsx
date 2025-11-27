'use client';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useTRPC } from '../../lib/trpc';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogInUserInput } from '@repo/common';
import { useForm } from 'react-hook-form';
import { TextFieldGroup } from '@/components/InputGroup';

export default function LogIn() {
  const trpc = useTRPC();
  const router = useRouter();
  const { addToast } = useToast();

  const defaultValues = useMemo(() => LogInUserInput.parse({}), []);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(LogInUserInput),
    defaultValues,
    mode: 'onBlur',
  });

  const {
    mutate: logInUser,
    isPending,
    error,
  } = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: (data) => {
        addToast({
          header: 'Success',
          body: 'User logged in successfully!',
          variant: 'success',
        });
        router.push('/chats');
      },
      onError: (error) => {
        addToast({
          header: 'Error',
          body: error.message || 'Failed to log in, please try again later.',
          variant: 'danger',
        });
      },
    })
  );

  const onSubmit = async (data: LogInUserInput) => {
    try {
      await logInUser(data);
    } catch (error) {
      console.error(error, 'Failed to register user.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-black-500">
      <h1>Log In Below!</h1>
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
        <div>
          <button type="submit">Log In</button>
          <div className="flex gap-2 items-center ">
            <small className="text-sm">Not yet registed?</small>
            <Link className="text-sm" href={'/signup'}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
