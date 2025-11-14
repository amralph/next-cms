import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { Template } from '@/types/template';
import React from 'react';
import { RowDataPacket } from 'mysql2';
import { DocumentsClient } from './DocumentsClient';
import { DocumentContainer } from '@/types/document';
import { signUrlsInContentObject } from './SignDocument';
import { authorizeWorkspaceOrRedirect } from '@/lib/userBelongsToWorkspace';

const page = async ({
  params,
}: {
  params: Promise<{ templateId: string; workspaceId: string }>;
}) => {
  const sub = await getSubAndRedirect('/');
  const templateId = (await params).templateId;
  const workspaceId = (await params).workspaceId;

  await authorizeWorkspaceOrRedirect(sub, workspaceId, '/');

  const [rows] = await pool.query<
    (RowDataPacket & {
      documents: DocumentContainer[] | null; // could be null if no documents
      template_id: string;
      template_template: Template;
      workspace_id: string;
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

  // mutate documents to sign urls
  await Promise.allSettled(
    result.documents?.map((document) =>
      signUrlsInContentObject(document.content)
    ) ?? []
  );

  return <DocumentsClient result={result} />;
};

export default page;
