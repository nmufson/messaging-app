'use client';
import { useState } from 'react';

const INITIAL_FORM_STATE = {
  email: '',
  password: '',
};

export default function LogIn() {
  const [logInForm, setLogInForm] = useState(INITIAL_FORM_STATE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogInForm({ ...logInForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
