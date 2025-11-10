'use client';

import React from 'react';
import { deleteDocument, updateDocument } from './actions';
import { Template } from '@/types/template';
import { Content } from '@/types/extendsRowDataPacket';
import { DocumentFormContents } from './DocumentFormContents';

export const DocumentContainer = ({
  id,
  workspaceId,
  templateId,
  content,
  template,
}: {
  id: string;
  workspaceId: string;
  templateId: string;
  content: Content;
  template: Template;
}) => {
  async function handleDeleteDocument(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await deleteDocument(formData);
  }

  async function handleUpdateDocument(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await updateDocument(formData, id, templateId, workspaceId);
  }

  return (
    <div className='border border-white p-2 space-y-2 flex'>
      <div>
        <h2 className='text-md'>Reference ID: {id}</h2>
        <form onSubmit={handleUpdateDocument} className='space-y-2'>
          <DocumentFormContents
            template={template}
            content={content}
          ></DocumentFormContents>

          <button>Update</button>
        </form>
        <form onSubmit={handleDeleteDocument}>
          <input hidden readOnly name='id' id='id' value={id}></input>
          <button>Delete</button>
        </form>
      </div>
    </div>
  );
};
