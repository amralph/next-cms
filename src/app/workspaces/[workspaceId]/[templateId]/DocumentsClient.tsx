'use client';

import React, { useState } from 'react';
import Breadcrumbs from '../../Breadcrumbs';
import { CreateDocumentForm } from './CreateDocumentForm';
import { DocumentContainer } from './DocumentContainer';
import { RowDataPacket } from 'mysql2';
import { Template } from '@/types/template';
import { DocumentContainer as DocumentContainerType } from '@/types/document';

export const DocumentsClient = ({
  result,
}: {
  result: RowDataPacket & {
    documents: DocumentContainerType[] | null;
    template_id: string;
    template_template: Template;
    workspace_id: string;
    workspace_name: string;
  };
}) => {
  const [documentsState, setDocumentsState] = useState(result.documents || []);

  return (
    <div className='space-y-2'>
      <Breadcrumbs
        segments={[
          { name: 'Workspaces', id: 'workspaces' },
          { name: `${result.workspace_name}`, id: `${result.workspace_id}` },
          {
            name: `${result.template_template.name}`,
            id: `${result.template_id}`,
          },
        ]}
      ></Breadcrumbs>
      <h1>{result.template_template.name}</h1>
      <div>
        <CreateDocumentForm
          workspaceId={result.workspace_id}
          templateId={result.template_id}
          template={result.template_template}
          setDocumentsState={setDocumentsState}
        />
      </div>
      {documentsState.map((document) => {
        return (
          <DocumentContainer
            key={document.id}
            id={document.id}
            workspaceId={result.workspace_id}
            templateId={result.template_id}
            content={document.content}
            template={result.template_template}
            setDocumentsState={setDocumentsState}
          ></DocumentContainer>
        );
      })}
    </div>
  );
};
