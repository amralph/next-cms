'use client';

import { useState } from 'react';
import Breadcrumbs from '../../Breadcrumbs';
import { CreateDocumentForm } from './CreateDocumentForm';
import { DocumentContainer } from './DocumentContainer';
import { TemplateJSON, SignedDocumentRow } from '@/types/types';

export const DocumentsClient = ({
  documents,
  template,
  templateId,
  workspaceId,
  workspaceName,
}: {
  documents: SignedDocumentRow[];
  templateId: string;
  template: TemplateJSON;
  workspaceId: string;
  workspaceName: string;
}) => {
  const [documentsState, setDocumentsState] = useState(documents || []);

  // in here, let's get the documents required for each reference field...

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
        <CreateDocumentForm
          workspaceId={workspaceId}
          templateId={templateId}
          template={template}
          setDocumentsState={setDocumentsState}
        />
      </div>
      {documentsState.map((document) => {
        return (
          <DocumentContainer
            key={document.id}
            id={document.id || ''}
            workspaceId={workspaceId}
            templateId={templateId}
            content={document.content}
            signedContent={document.signedContent}
            template={template}
            setDocumentsState={setDocumentsState}
          ></DocumentContainer>
        );
      })}
    </div>
  );
};
