'use client';

import React from 'react';
import { deleteTemplate, updateTemplate } from './actions';
import Link from 'next/link';
import { Template } from '@/types/template';

export const TemplateContainer = ({
  id,
  workspaceId,
  template,
}: {
  id: string;
  workspaceId: string;
  template: Template;
}) => {
  async function handleDeleteTemplate(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await deleteTemplate(formData);
  }

  async function handleUpdateTemplate(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await updateTemplate(formData, id);
  }

  return (
    <div className='border border-white p-2 space-y-2'>
      <Link href={`/workspaces/${workspaceId}/${id}`}>
        <h2>{template.name}</h2>
      </Link>
      <form onSubmit={handleUpdateTemplate} className='space-y-2'>
        <textarea
          name='template'
          placeholder={'JSON template'}
          className='w-full'
          defaultValue={JSON.stringify(template, null, 2)}
        ></textarea>
        <input hidden readOnly name='id' id='id' value={id}></input>
        <button>Update</button>
      </form>
      <form onSubmit={handleDeleteTemplate}>
        <input hidden readOnly name='id' id='id' value={id}></input>
        <button>Delete</button>
      </form>
    </div>
  );
};
