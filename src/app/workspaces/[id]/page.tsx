import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { Template, Workspace } from '@/types/extendsRowDataPacket';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { NewTemplateForm } from './NewTemplateForm';
import styles from '../../page.module.css';
import { TemplateContainer } from './TemplateContainer';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const sub = await getSubAndRedirect('/');
  const workspaceId = (await params).id;

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
    <div className={styles.page}>
      <span>
        <Link href='/workspaces'>/workspaces/</Link>
        <p>{workspace.name}</p>
      </span>
      <h1>{workspace.name}</h1>
      <div>
        {templates.map((template) => (
          <TemplateContainer
            key={template.id}
            id={template.id}
            name={template.name}
            jsonTemplate={template.template}
          />
        ))}
      </div>
      <div>
        <NewTemplateForm workspaceId={workspaceId}></NewTemplateForm>
      </div>
    </div>
  );
};

export default page;
