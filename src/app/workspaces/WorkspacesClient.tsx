'use client';

import React, { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { CreateWorkSpaceForm } from './CreateWorkSpaceForm';
import { WorkspaceRow } from '@/types/types';
import { WorkspaceContainer } from './WorkspaceContainer';

interface WorkspaceRowWithSecretKey extends WorkspaceRow {
  secret?: string;
}

export const WorkspacesClient = ({
  workspaces,
}: {
  workspaces: WorkspaceRow[];
}) => {
  const [workspacesState, setWorkspacesState] =
    useState<WorkspaceRowWithSecretKey[]>(workspaces);

  return (
    <div className='space-y-4'>
      <Breadcrumbs
        segments={[{ name: 'Workspaces', id: 'workspaces' }]}
      ></Breadcrumbs>
      <h1 className='text-2xl font-bold'>Workspaces</h1>
      <CreateWorkSpaceForm setWorkspacesState={setWorkspacesState} />
      <div className='space-y-2'>
        {workspacesState?.map((workspace) => (
          <WorkspaceContainer
            key={workspace.id}
            id={workspace.id || ''}
            name={workspace.name || ''}
            isPrivate={workspace.private ?? false}
            createdAt={
              workspace.created_at ? new Date(workspace.created_at) : new Date()
            }
          />
        ))}
      </div>
    </div>
  );
};
