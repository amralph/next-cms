'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { deleteWorkspace, updateWorkspace } from './actions';
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
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  async function handleDeleteWorkspace(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);

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

    setLoadingDelete(false);
  }

  async function handleUpdateWorkspace(e: React.FormEvent<HTMLFormElement>) {
    setLoadingUpdate(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateWorkspace(formData);

    if (result.success) {
      setWorkspacesState((workspaces) => {
        const indexOfWorkspace = workspaces.findIndex((w) => w.id === id);
        return [
          ...workspaces.slice(0, indexOfWorkspace),
          result.result as Workspace,
          ...workspaces.slice(indexOfWorkspace + 1),
        ];
      });
    } else {
      alert('Error updating');
    }

    setLoadingUpdate(false);
  }

  return (
    <div className='border border-white p-2 space-y-2'>
      <Link href={`/workspaces/${id}`}>
        <h2 className='text-xl font-bold'>{name}</h2>
      </Link>
      <form
        onSubmit={handleUpdateWorkspace}
        className='space-x-2 flex items-center'
      >
        <label>Name</label>
        <input name='name' defaultValue={name}></input>

        <Button loading={loadingUpdate}>Update name</Button>
        <input hidden readOnly name='id' value={id}></input>
      </form>
      <form onSubmit={handleDeleteWorkspace}>
        <input hidden readOnly name='id' value={id}></input>
        <Button loading={loadingDelete}>Delete</Button>
      </form>
    </div>
  );
};
