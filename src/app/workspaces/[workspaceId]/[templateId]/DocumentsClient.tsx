'use client';

import { useState } from 'react';
import Breadcrumbs from '../../Breadcrumbs';
import { CreateDocumentForm } from './CreateDocumentForm';
import { DocumentContainer } from './DocumentContainer';
import { SignedDocumentRow } from '@/types/types';
import { DocumentFormContents } from './DocumentFormContents';
import { useDocumentsPageContext } from './Providers/DocumentsPageProvider';

export const DocumentsClient = ({
  documents,
}: {
  documents: SignedDocumentRow[];
}) => {
  const { workspaceId, workspaceName, templateId, template } =
    useDocumentsPageContext();

  const [documentsState, setDocumentsState] = useState(documents || []);

  return (
    <div className='space-y-2'>
      <Breadcrumbs
        segments={[
          { name: 'Workspaces', id: 'workspaces' },
          { name: `${workspaceName}`, id: `${workspaceId}` },
          {
            name: `${template.name}`,
            id: `${templateId}`,
          },
        ]}
      ></Breadcrumbs>
      <h1>{template.name}</h1>
      <div>
        <CreateDocumentForm setDocumentsState={setDocumentsState}>
          <DocumentFormContents />
        </CreateDocumentForm>
      </div>
      {documentsState.map((document) => {
        return (
          <DocumentContainer
            key={document.id}
            id={document.id || ''}
            content={document.content}
            signedContent={document.signedContent}
            setDocumentsState={setDocumentsState}
          ></DocumentContainer>
        );
      })}
    </div>
  );
};
