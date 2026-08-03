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
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-4 py-12">
      <form
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-sky-100 flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Register Below!</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create your account to get started.
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

        <div className="flex flex-col gap-4 mt-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Sign Up
          </button>

          <div className="flex gap-1.5 items-center justify-center text-sm">
            <span className="text-slate-600">Already registered?</span>
            <Link
              className="text-sky-600 hover:text-sky-700 font-medium hover:underline transition-colors"
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
