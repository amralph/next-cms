'use client';

import React from 'react';
import { newTemplate } from './actions';

export const NewTemplateForm = ({ workspaceId }: { workspaceId: string }) => {
  async function handleNewTemplate(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await newTemplate(formData);
  }

  return (
    <form
      className='space-y-2 border border-white p-2'
      onSubmit={handleNewTemplate}
    >
      <h2>New template</h2>
      <div className='space-x-2'>
        <label>Name</label>
        <input name='name' placeholder={'name'}></input>
      </div>
      <div className='space-x-2'>
        <label>JSON template</label>
        <textarea name='template' placeholder={'JSON template'}></textarea>
      </div>
      <input hidden readOnly name='workspaceId' value={workspaceId}></input>
      <button>Create</button>
    </form>
  );
};
