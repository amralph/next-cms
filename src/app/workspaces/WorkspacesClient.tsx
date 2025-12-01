'use client';

import React, { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { CreateWorkSpaceForm } from './CreateWorkSpaceForm';
import { WorkspaceContainer } from './WorkspaceContainer';
import { Workspace } from '@/types/extendsRowDataPacket';

export const WorkspacesClient = ({
  workspaces,
}: {
  workspaces: Workspace[];
}) => {
  const [workspacesState, setWorkspacesState] = useState(workspaces);

  return (
    <div className='space-y-4'>
      <Breadcrumbs
        segments={[{ name: 'Workspaces', id: 'workspaces' }]}
      ></Breadcrumbs>
      <h1 className='text-2xl font-bold'>Workspaces</h1>
      <CreateWorkSpaceForm setWorkspacesState={setWorkspacesState} />
      <div className='space-y-2'>
        {workspacesState.map((workspace) => (
          <WorkspaceContainer
            key={workspace.id}
            id={workspace.id}
            name={workspace.name}
            isPrivate={workspace.private}
            publicKey={workspace.public_key}
            secretKey={workspace.secret}
            setWorkspacesState={setWorkspacesState}
          />
        ))}
      </div>
    </div>
  );
};
