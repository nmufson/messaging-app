'use client';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useTRPC } from '../../lib/trpc';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const INITIAL_FORM_STATE = {
  email: '',
  password: '',
};

export default function LogIn() {
  const trpc = useTRPC();
  const router = useRouter();

  const [logInForm, setLogInForm] = useState(INITIAL_FORM_STATE);

  const { mutate, isPending, error } = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: () => {
        console.log('Logged in successfully!');
        router.push('/chats');
      },
    })
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLogInForm({ ...logInForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    mutate(logInForm);
  };

  return (
    <div className="bg-black-500">
      <h1>Log In Below!</h1>
      <form onSubmit={handleSubmit}>
        <div className="label-input">
          <label htmlFor="email">Email:</label>
          <input
            className="border"
            type="email"
            name="email"
            id="email"
            required
            autoComplete="email"
            onChange={handleChange}
          ></input>
        </div>
        <div className="label-input">
          <label htmlFor="password">Password:</label>

          <input
            className="border"
            type="password"
            name="password"
            id="password"
            required
            autoComplete="current-password"
            onChange={handleChange}
          />
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
