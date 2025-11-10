'use client';

import React from 'react';
import { createDocument } from './actions';
import { Template } from '@/types/template';
import { DocumentFormContents } from './DocumentFormContents';

export const CreateDocumentForm = ({
  templateId,
  workspaceId,
  template,
}: {
  templateId: string;
  workspaceId: string;
  template: Template;
}) => {
  async function handleCreateDocument(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await createDocument(formData, templateId, workspaceId);
  }

  return (
    <div className='border border-white p-2 space-y-2'>
      <h2>Create {template.name}</h2>
      <form onSubmit={handleCreateDocument} className='space-y-2'>
        <DocumentFormContents template={template}></DocumentFormContents>
        <button type='submit'>Create {template.name}</button>
      </form>
    </div>
  );
};
