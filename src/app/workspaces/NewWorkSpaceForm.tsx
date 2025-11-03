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
      <button>New workspace</button>
      <input placeholder={'name'} name='name'></input>
    </form>
  );
};
