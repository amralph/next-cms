'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { deleteWorkspace } from './actions';
import { Workspace } from '@/types/extendsRowDataPacket';
import { Button } from '@/components/Button';

export const WorkspaceContainer = ({
  id,
  name,
  setWorkspacesState,
}: {
  id: string;
  name: string;
  setWorkspacesState: React.Dispatch<React.SetStateAction<Workspace[]>>;
}) => {
  const [loading, setLoading] = useState(false);

  async function handleDeleteWorkspace(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await deleteWorkspace(formData);

    if (result.success) {
      setWorkspacesState((workspaces) => {
        return workspaces.filter((workspace) => workspace.id !== id);
      });
    } else {
      alert('Error deleting');
    }

    setLoading(false);
  }

  return (
    <div className='border border-white p-2'>
      <Link href={`/workspaces/${id}`}>
        <h2 className='text-xl font-bold'>{name}</h2>
      </Link>
      <form onSubmit={handleDeleteWorkspace}>
        <input hidden readOnly name='id' id='id' value={id}></input>
        <Button loading={loading}>Delete</Button>
      </form>
    </div>
  );
};
