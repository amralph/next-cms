'use client';

import React, { useState } from 'react';
import { createDocument } from './actions';
import { TemplateJSON, SignedDocumentRow } from '@/types/types';
import { DocumentFormContents } from './DocumentFormContents';
import { Button } from '@/components/Button';

export const CreateDocumentForm = ({
  workspaceId,
  templateId,
  template,
  setDocumentsState,
}: {
  workspaceId: string;
  templateId: string;
  template: TemplateJSON;
  setDocumentsState: React.Dispatch<React.SetStateAction<SignedDocumentRow[]>>;
}) => {
  const [loading, setLoading] = useState(false);

  async function handleCreateDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const result = await createDocument(
      formData,
      workspaceId,
      templateId,
      template.name
    );

    if (result.success) {
      setDocumentsState((documents) => {
        return [
          {
            id: result.result?.documentId as string,
            content: result.result?.content,
            template: template,
            signedContent: result.result?.signedContent,
          },
          ...documents,
        ];
      });
    } else {
      alert('Error creating document');
    }

    setLoading(false);
  }

  return (
    <div className='border border-white p-2 space-y-2'>
      <h2>Create {template.name}</h2>
      <form onSubmit={handleCreateDocument} className='space-y-2'>
        <DocumentFormContents
          workspaceId={workspaceId}
          template={template}
        ></DocumentFormContents>
        <Button loading={loading}>Create {template.name}</Button>
      </form>
    </div>
  );
};
