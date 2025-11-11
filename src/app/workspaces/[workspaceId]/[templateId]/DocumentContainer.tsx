'use client';

import React, { useState } from 'react';
import { deleteDocument, updateDocument } from './actions';
import { Template } from '@/types/template';
import { Content } from '@/types/extendsRowDataPacket';
import { DocumentFormContents } from './DocumentFormContents';
import { Button } from '@/components/Button';
import { DocumentContainer as DocumentContainerType } from '@/types/document';

export const DocumentContainer = ({
  id,
  content,
  template,
  setDocumentsState,
}: {
  id: string;
  content: Content;
  template: Template;
  setDocumentsState: React.Dispatch<
    React.SetStateAction<DocumentContainerType[] | null>
  >;
}) => {
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function handleUpdateDocument(e: React.FormEvent<HTMLFormElement>) {
    setLoadingUpdate(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateDocument(formData, id);

    if (!result.success) {
      alert('Error updating document');
    }

    setLoadingUpdate(false);
  }

  async function handleDeleteDocument(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await deleteDocument(formData);

    if (result.success) {
      setDocumentsState((documents) => {
        if (documents?.length) {
          return documents.filter((document) => document.id !== id);
        } else {
          return [];
        }
      });
    } else {
      alert('Error deleting document');
    }

    setLoadingDelete(false);
  }

  return (
    <div className='border border-white p-2 space-y-2 flex'>
      <div>
        <h2 className='text-md'>Reference ID: {id}</h2>
        <div className='space-y-2'>
          <form onSubmit={handleUpdateDocument} className='space-y-2'>
            <DocumentFormContents
              template={template}
              content={content}
            ></DocumentFormContents>

            <Button loading={loadingUpdate}>Update</Button>
          </form>
          <form onSubmit={handleDeleteDocument}>
            <input hidden readOnly name='id' id='id' value={id}></input>
            <Button loading={loadingDelete}>Delete</Button>
          </form>
        </div>
      </div>
    </div>
  );
};
