import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { CreateWorkSpaceForm } from './CreateWorkSpaceForm';
import React from 'react';
import pool from '@/lib/db';

import { Workspace } from '@/types/extendsRowDataPacket';
import { WorkspaceContainer } from './WorkspaceContainer';
import Breadcrumbs from './Breadcrumbs';

const Workspaces = async () => {
  const sub = await getSubAndRedirect('/');

  const [workspaces] = await pool.query<Workspace[]>(
    `SELECT w.*
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE u.cognito_user_id = ?`,
    [sub]
  );

  return (
    <div className='space-y-4'>
      <Breadcrumbs
        segments={[{ name: 'workspaces', id: 'workspaces' }]}
      ></Breadcrumbs>
      <h1 className='text-2xl font-bold'>Workspaces</h1>
      <CreateWorkSpaceForm />
      <div className='space-y-2'>
        {workspaces.map((workspace) => (
          <WorkspaceContainer
            key={workspace.id}
            id={workspace.id}
            name={workspace.name}
          />
        ))}
      </div>
    </div>
  );
};

export default Workspaces;
