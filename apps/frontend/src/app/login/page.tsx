'use client';
import { TextFieldGroup } from '@/components/FieldGroup';
import { useToast } from '@/context/Toast/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogInUserInput } from '@repo/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTRPC } from '../../lib/trpc';

export default function LogIn() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
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
        queryClient.setQueryData(trpc.auth.me.queryKey(), data);
        window.location.href = '/chats';
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
    <div className="flex min-h-screen items-center justify-center bg-brand-accent px-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8"
      >
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Log in to continue messaging.
          </p>
        </div>

        <div className="space-y-2">
          <TextFieldGroup
            type="email"
            label="Email"
            name="email"
            control={control}
            placeholder="you@example.com"
          />
          <TextFieldGroup
            type="password"
            label="Password"
            name="password"
            control={control}
            placeholder="••••••••"
          />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {isPending ? 'Logging in...' : 'Log In'}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-sm">
            <span className="text-slate-600">Not yet registered?</span>
            <Link
              className="font-semibold text-brand transition hover:text-blue-600 hover:underline"
              href={'/signup'}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
