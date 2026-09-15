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
        queryClient.setQueryData(trpc.auth.me.queryKey(), data);
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
    <div className="flex min-h-screen items-center justify-center bg-brand-accent px-4 py-12">
      <form
        className="flex w-full max-w-md flex-col gap-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign up to start messaging.
          </p>
        </div>

        <div className="flex flex-col gap-4">
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
          <TextFieldGroup
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            control={control}
            placeholder="••••••••"
          />
        </div>

        <div className="mt-2 flex flex-col gap-4">
          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            Sign Up
          </button>

          <div className="flex items-center justify-center gap-1.5 text-sm">
            <span className="text-slate-600">Already registered?</span>
            <Link
              className="font-semibold text-brand transition hover:text-blue-600 hover:underline"
              href="/login"
            >
              Log In
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
