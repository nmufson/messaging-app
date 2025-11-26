'use client';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useTRPC } from '../../lib/trpc';
import { useMutation } from '@tanstack/react-query';
import { CreateUserInput } from '@repo/common';
import { FieldConfig } from '@/components/InputGroup';

const INITIAL_FORM_STATE: CreateUserInput = {
  email: '',
  password: '',
  confirmPassword: '',
};

const FIELD_CONFIG: FieldConfig<CreateUserInput>[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
  },
];

export default function SignUp() {
  const trpc = useTRPC();

  const [signUpForm, setSignUpForm] = useState(INITIAL_FORM_STATE);

  const { mutate, isPending, error } = useMutation(
    trpc.auth.register.mutationOptions()
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSignUpForm({ ...signUpForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    mutate(signUpForm);
  };

  return (
    <div className="bg-black-500">
      <h1>Register Below!</h1>
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
            value={signUpForm.email}
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
            autoComplete="new-password"
            value={signUpForm.password}
            onChange={handleChange}
          />
        </div>
        <div className="label-input">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            className="border"
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
            autoComplete="new-password"
            value={signUpForm.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
