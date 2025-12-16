'use client';

import { useState } from 'react';
import Breadcrumbs from '../../Breadcrumbs';
import { CreateDocumentForm } from './CreateDocumentForm';
import { DocumentContainer } from './DocumentContainer';
import { TemplateJSON, SignedDocumentRow, SignedFile } from '@/types/types';
import { initialPage } from '@/lib/pagination';

export const DocumentsClient = ({
  documents,
  template,
  templateId,
  workspaceId,
  workspaceName,
  initialFiles,
}: {
  documents: SignedDocumentRow[];
  templateId: string;
  template: TemplateJSON;
  workspaceId: string;
  workspaceName: string;
  initialFiles: SignedFile[];
}) => {
  const [documentsState, setDocumentsState] = useState(documents || []);
  const [files, setFiles] = useState(initialFiles);
  const [currentFilesPage, setCurrentFilesPage] = useState(initialPage);
  const [loadingFiles, setLoadingFiles] = useState(false);

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
          files={files}
          setFiles={setFiles}
          currentFilesPage={currentFilesPage}
          setCurrentFilesPage={setCurrentFilesPage}
          loadingFiles={loadingFiles}
          setLoadingFiles={setLoadingFiles}
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
            files={files}
            setFiles={setFiles}
            currentFilesPage={currentFilesPage}
            setCurrentFilesPage={setCurrentFilesPage}
            loadingFiles={loadingFiles}
            setLoadingFiles={setLoadingFiles}
            setDocumentsState={setDocumentsState}
          ></DocumentContainer>
        );
      })}
    </div>
  );
};
