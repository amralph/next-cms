import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import React from 'react';
import pool from '@/lib/db';

import { Workspace } from '@/types/extendsRowDataPacket';
import { WorkspacesClient } from './WorkspacesClient';

const Workspaces = async () => {
  const sub = await getSubAndRedirect('/');

  const [workspaces] = await pool.query<Workspace[]>(
    `SELECT w.id, user_id, name, w.created_at, updated_at, public_key, private
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE u.cognito_user_id = ?`,
    [sub]
  );

  return <WorkspacesClient workspaces={workspaces} />;
};

export default Workspaces;
