import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { Document } from '@/types/extendsRowDataPacket';
import { Template } from '@/types/template';
import React from 'react';
import { CreateDocumentForm } from './CreateDocumentForm';
import { DocumentContainer } from './DocumentContainer';
import Breadcrumbs from '../../Breadcrumbs';
import { RowDataPacket } from 'mysql2';

const page = async ({
  params,
}: {
  params: Promise<{ templateId: string; workspaceId: string }>;
}) => {
  const sub = await getSubAndRedirect('/');
  const templateId = (await params).templateId;
  const workspaceId = (await params).workspaceId;

  const [rows] = await pool.query<
    (RowDataPacket & {
      documents: Document[] | null; // could be null if no documents
      template_id: number;
      template_template: Template;
      workspace_id: number;
      workspace_name: string;
    })[]
  >(
    `
  SELECT 
    t.id AS template_id,
    t.template AS template_template,
    w.id AS workspace_id,
    w.name AS workspace_name,
    (
        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id', d.id,
                       'content', d.content,
                       'template_id', d.template_id,
                       'created_at', d.created_at
                   )
               )
        FROM documents d
        WHERE d.template_id = t.id
    ) AS documents
  FROM templates t
  JOIN workspaces w ON t.workspace_id = w.id
  JOIN users u ON w.user_id = u.id
  WHERE u.cognito_user_id = ? AND w.id = ? AND t.id = ?;
  `,
    [sub, workspaceId, templateId]
  );

  const result = rows[0];

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
      <h1>{result.template_name}</h1>
      <div>
        <CreateDocumentForm
          templateId={templateId}
          workspaceId={workspaceId}
          template={result.template_template}
        />
      </div>
      {result.documents?.map((document) => {
        return (
          <DocumentContainer
            key={document.id}
            id={document.id}
            workspaceId={workspaceId}
            templateId={templateId}
            content={document.content}
            template={result.template_template}
          ></DocumentContainer>
        );
      })}
    </div>
  );
};

export default page;
