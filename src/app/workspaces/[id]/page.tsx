import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { Workspace } from '@/types/workspace';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  // redirect if not logged in
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

  return (
    <div>
      <span>
        <Link href='/workspaces'>/workspaces/</Link>
        <p>{workspace.name}</p>
      </span>
      <h1>{workspace.name}</h1>
    </div>
  );
};

export default page;
