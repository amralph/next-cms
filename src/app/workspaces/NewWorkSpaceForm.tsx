'use client';

import React from 'react';
import { newWorkspace } from './actions';

export const NewWorkSpaceForm = () => {
  async function handleNewWorkspace(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);

    await newWorkspace(formData);
  }
  return (
    <form onSubmit={handleNewWorkspace}>
      <div className='flex space-x-2'>
        <label>New workspace</label>
        <input
          className='border border-white'
          placeholder={'name'}
          name='name'
        />
      </div>
      <button className='border border-white text-white px-2 py-1 rounded hover:cursor-pointer'>
        Create
      </button>
    </form>
  );
};
