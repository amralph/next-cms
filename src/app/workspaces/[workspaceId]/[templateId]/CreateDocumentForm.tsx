'use client';

import React, { useState } from 'react';
import { createDocument } from './actions';
import { TemplateJSON, SignedDocumentRow, SignedFile } from '@/types/types';
import { DocumentFormContents } from './DocumentFormContents';
import { Button } from '@/components/Button';

export const CreateDocumentForm = ({
  workspaceId,
  templateId,
  template,
  files,
  setFiles,
  currentFilesPage,
  setCurrentFilesPage,
  loadingFiles,
  setLoadingFiles,
  setDocumentsState,
}: {
  workspaceId: string;
  templateId: string;
  template: TemplateJSON;
  files: SignedFile[];
  setFiles: React.Dispatch<React.SetStateAction<SignedFile[]>>;
  currentFilesPage: number;
  setCurrentFilesPage: React.Dispatch<React.SetStateAction<number>>;
  loadingFiles: boolean;
  setLoadingFiles: React.Dispatch<React.SetStateAction<boolean>>;
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
      template.key
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
          files={files}
          setFiles={setFiles}
          currentFilesPage={currentFilesPage}
          setCurrentFilesPage={setCurrentFilesPage}
          loadingFiles={loadingFiles}
          setLoadingFiles={setLoadingFiles}
          workspaceId={workspaceId}
          template={template}
        ></DocumentFormContents>
        <Button loading={loading}>Create {template.name}</Button>
      </form>
    </div>
  );
};
