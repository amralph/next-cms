'use client';

import React, { useState } from 'react';
import { deleteTemplate, updateTemplate } from './actions';
import Link from 'next/link';
import { Template } from '@/types/template';
import { TemplateContainer as TemplateContainerType } from '@/types/template';
import { Button } from '@/components/Button';
export const TemplateContainer = ({
  id,
  workspaceId,
  template,
  setTemplatesState,
}: {
  id: string;
  workspaceId: string;
  template: Template;
  setTemplatesState: React.Dispatch<
    React.SetStateAction<TemplateContainerType[]>
  >;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  async function handleUpdateTemplate(e: React.FormEvent<HTMLFormElement>) {
    setLoadingUpdate(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateTemplate(formData, id);

    if (!result.success) {
      alert('Error updating template');
    }

    setLoadingUpdate(false);
  }

  async function handleDeleteTemplate(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await deleteTemplate(formData);

    if (result.success) {
      setTemplatesState((templates) => {
        return templates.filter((template) => template.id !== id);
      });
    } else {
      alert('Error deleting template');
    }

    setLoadingDelete(false);
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
        <Button loading={loadingUpdate}>Update</Button>
      </form>
      <form onSubmit={handleDeleteTemplate}>
        <input hidden readOnly name='id' id='id' value={id}></input>
        <Button loading={loadingDelete}>Delete</Button>
      </form>
    </div>
  );
};
