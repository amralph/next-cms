'use client';

import React, { useState } from 'react';
import { createWorkspace } from './actions';
import { Workspace } from '@/types/extendsRowDataPacket';
import { Button } from '@/components/Button';

export const CreateWorkSpaceForm = ({
  setWorkspacesState,
}: {
  setWorkspacesState: React.Dispatch<React.SetStateAction<Workspace[]>>;
}) => {
  const [loading, setLoading] = useState(false);

  async function handleCreateWorkspace(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await createWorkspace(formData);

    if (result.success && result.result) {
      setWorkspacesState((workspacesState) => [
        ...workspacesState,
        {
          id: result.result.workspaceId,
          name: result.result.name,
          secret: result.secret,
        } as Workspace,
      ]);
      alert(
        `Secret key generated. You won’t be able to see this key again. If lost, you’ll need to generate a new one.`
      );
    } else {
      alert('Error creating workspace');
    }

    setLoading(false);
  }
  return (
    <form
      onSubmit={handleCreateWorkspace}
      className='flex space-x-2 items-center'
    >
      <label>Create workspace</label>
      <input className='border border-white' placeholder={'name'} name='name' />
      <Button loading={loading}>Create</Button>
    </form>
  );
};
