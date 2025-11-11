'use client';

import React, { useState } from 'react';
import { createDocument } from './actions';
import { Template } from '@/types/template';
import { DocumentFormContents } from './DocumentFormContents';
import { Content } from '@/types/extendsRowDataPacket';
import { Button } from '@/components/Button';
import { DocumentContainer } from '@/types/document';

export const CreateDocumentForm = ({
  templateId,
  template,
  setDocumentsState,
}: {
  templateId: string;
  template: Template;
  setDocumentsState: React.Dispatch<
    React.SetStateAction<DocumentContainer[] | null>
  >;
}) => {
  const [loading, setLoading] = useState(false);

  async function handleCreateDocument(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const result = await createDocument(formData, templateId);

    if (result.success) {
      setDocumentsState((documents) => {
        if (documents?.length) {
          return [
            {
              id: result.result?.documentId as string,
              content: JSON.parse(result.result?.content || '{}') as Content,
              template: template,
            } as DocumentContainer,
            ...documents,
          ];
        } else {
          return [];
        }
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
        <DocumentFormContents template={template}></DocumentFormContents>
        <Button loading={loading}>Create {template.name}</Button>
      </form>
    </div>
  );
};
