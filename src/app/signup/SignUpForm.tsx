'use client';

import React from 'react';
import { signUpNewUser } from './actions';

export const SignUpForm = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      await signUpNewUser(formData);
      alert('User signed up successfully!');
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
        Sign Up
      </button>
    </form>
  );
};
