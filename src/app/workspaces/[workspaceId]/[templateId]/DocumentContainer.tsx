'use client';

import React, { useState } from 'react';
import { deleteDocument, updateDocument } from './actions';
import { TemplateJSON } from '@/types/template';
import { DocumentFormContents } from './DocumentFormContents';
import { Button } from '@/components/Button';
import { DocumentRow } from '@/types/document';

export const DocumentContainer = ({
  id,
  workspaceId,
  templateId,
  content,
  template,
  setDocumentsState,
}: {
  id: string;
  workspaceId: string;
  templateId: string;
  content: unknown;
  template: TemplateJSON;
  setDocumentsState: React.Dispatch<React.SetStateAction<DocumentRow[]>>;
}) => {
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function handleUpdateDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingUpdate(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateDocument(
      formData,
      workspaceId,
      templateId,
      template.key,
      id
    );

    if (result.success) {
      setDocumentsState((documents) => {
        const indexOfDocument = documents.findIndex(
          (document) => document.id === id
        );

        return [
          ...documents.slice(0, indexOfDocument),
          { id: id, content: result.result, template },
          ...documents.slice(indexOfDocument + 1),
        ];
      });
    } else {
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
        return documents.filter((document) => document.id !== id);
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
          <form
            id='updateForm'
            onSubmit={handleUpdateDocument}
            className='space-y-2'
          >
            <DocumentFormContents
              template={template}
              content={content}
            ></DocumentFormContents>
          </form>
          <div className='flex space-x-2'>
            <Button form='updateForm' loading={loadingUpdate}>
              Update
            </Button>
            <form name='deleteForm' onSubmit={handleDeleteDocument}>
              <input hidden readOnly name='id' id='id' value={id}></input>
              <Button loading={loadingDelete}>Delete</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
