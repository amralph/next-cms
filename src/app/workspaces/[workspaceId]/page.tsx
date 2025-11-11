import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { Workspace } from '@/types/extendsRowDataPacket';
import { TemplateContainer } from '@/types/template';
import { redirect } from 'next/navigation';
import { WorkspaceClient } from './WorkspaceClient';

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
  const [templates] = await pool.query<TemplateContainer[]>(
    `
    SELECT t.*
    FROM templates t
    JOIN workspaces w ON t.workspace_id = w.id
    WHERE w.id = ?
    `,
    [workspaceId]
  );

  return <WorkspaceClient templates={templates} workspace={workspace} />;
};

export default page;
