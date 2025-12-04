'use client';

import React from 'react';
import { signInWithEmail } from './actions';

export const SignInForm = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      await signInWithEmail(formData);
      alert('User signed in successfully!');
    } catch (err) {
      alert('Error: ' + err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-2 w-64 mx-auto mt-10'
    >
      <input
        type='email'
        name='email'
        placeholder='Email'
        required
        className='border p-2 rounded'
      />
      <input
        type='password'
        name='password'
        placeholder='Password'
        required
        className='border p-2 rounded'
      />
      <button type='submit' className='bg-blue-500 text-white p-2 rounded mt-2'>
        Sign In
      </button>
    </form>
  );
};
