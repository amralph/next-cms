'use client';

import React from 'react';
import { createWorkspace } from './actions';

export const CreateWorkSpaceForm = () => {
  async function handleCreateWorkspace(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);

    await createWorkspace(formData);
  }
  return (
    <form onSubmit={handleCreateWorkspace}>
      <div className='flex space-x-2'>
        <label>Create workspace</label>
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
