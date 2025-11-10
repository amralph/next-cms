import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { Workspace } from '@/types/extendsRowDataPacket';
import { Template } from '@/types/template';
import { redirect } from 'next/navigation';
import React from 'react';
import { CreateTemplateForm } from './CreateTemplateForm';
import { TemplateContainer } from './TemplateContainer';
import Breadcrumbs from '../Breadcrumbs';

const page = async ({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const sub = await getSubAndRedirect('/');
  const workspaceId = (await params).workspaceId;

  const [workspaces] = await pool.query<Workspace[]>(
    `SELECT w.*
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE u.cognito_user_id = ? AND
      w.id = ?`,
    [sub, workspaceId]
  );

  const workspace = workspaces[0];

  if (!workspace) redirect('/');

  // get templates that only belong to this workspace

  const [templates] = await pool.query<Template[]>(
    `
    SELECT t.*
    FROM templates t
    JOIN workspaces w ON t.workspace_id = w.id
    WHERE w.id = ?
    `,
    [workspaceId]
  );

  return (
    <div className='space-y-2'>
      <Breadcrumbs
        segments={[
          { name: 'Workspaces', id: 'workspaces' },
          { name: `${workspace.name}`, id: `${workspace.id}` },
        ]}
      ></Breadcrumbs>
      <h1>{workspace.name}</h1>
      <CreateTemplateForm workspaceId={workspaceId} />
      <div className='space-y-2'>
        {templates.map((template) => (
          <TemplateContainer
            key={template.id}
            id={template.id}
            workspaceId={workspaceId}
            template={template.template}
          />
        ))}
      </div>
    </div>
  );
};

export default page;
