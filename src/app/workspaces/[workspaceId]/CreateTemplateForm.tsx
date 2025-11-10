'use client';

import React from 'react';
import { createTemplate } from './actions';

export const CreateTemplateForm = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  async function handleCreateTemplate(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await createTemplate(formData);
  }

  return (
    <form
      className='space-y-2 border border-white p-2'
      onSubmit={handleCreateTemplate}
    >
      <h2>Create template</h2>
      <div className='space-x-2'>
        <label>JSON template</label>
        <textarea
          name='template'
          placeholder={'JSON template'}
          className='w-full'
        ></textarea>
      </div>
      <input hidden readOnly name='workspaceId' value={workspaceId}></input>
      <button>Create</button>
    </form>
  );
};
