'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  deleteWorkspace,
  updateSecret,
  updateWorkspace,
  updatePrivate,
} from './actions';
import { WorkspaceRow } from '@/types/extendsRowDataPacket';
import { Button } from '@/components/Button';
import Spinner from '@/components/Spinner';

export const WorkspaceContainer = ({
  id,
  name,
  isPrivate,
  publicKey,
  secretKey,
  setWorkspacesState,
}: {
  id: string;
  name: string;
  isPrivate: boolean;
  publicKey: string;
  secretKey?: string;
  setWorkspacesState: React.Dispatch<React.SetStateAction<WorkspaceRow[]>>;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [loadingTogglePrivate, setLoadingTogglePrivate] = useState(false);
  const [secretState, setSecretState] = useState(secretKey);

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
          result.result as WorkspaceRow,
          ...workspaces.slice(indexOfWorkspace + 1),
        ];
      });
    } else {
      alert('Error updating');
    }

    setLoadingUpdate(false);
  }

  async function handleGenerateSecret(e: React.FormEvent<HTMLFormElement>) {
    setLoadingSecret(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateSecret(formData);

    if (result.success) {
      setSecretState(result.secret);
      alert(
        `Secret key generated. You won’t be able to see this key again. If lost, you’ll need to generate a new one.`
      );
    } else {
      alert('Error generating new key.');
    }

    setLoadingSecret(false);
  }

  async function handleTogglePrivate(e: React.FormEvent<HTMLFormElement>) {
    setLoadingTogglePrivate(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updatePrivate(formData);

    if (!result.success) {
      alert('Error toggling privacy.');
    }

    setLoadingTogglePrivate(false);
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

        <Button loading={loadingUpdate}>Update</Button>
        <input hidden readOnly name='id' value={id}></input>
      </form>
      <form onSubmit={handleTogglePrivate}>
        <input hidden readOnly name='id' value={id}></input>
        <div className='flex space-x-2'>
          <label>Private</label>
          <input
            type='checkbox'
            name='private'
            defaultChecked={isPrivate}
            disabled={loadingTogglePrivate}
            onChange={(e) => {
              e.target.form?.requestSubmit(); // triggers form submit just like a button
            }}
          />
          {loadingTogglePrivate && <Spinner></Spinner>}
        </div>
      </form>

      <span className='space-x-2 flex'>
        <p>Public key:</p>
        <p className='text-green-400'>{publicKey}</p>
      </span>
      {secretState && (
        <span className='space-x-2 flex'>
          <p>Secret key:</p>
          <p className='text-orange-400'>{secretState}</p>
        </span>
      )}
      <form onSubmit={handleGenerateSecret}>
        <input hidden readOnly name='id' value={id}></input>
        <Button loading={loadingSecret}>Generate new secret key</Button>
      </form>
      <form onSubmit={handleDeleteWorkspace}>
        <input hidden readOnly name='id' value={id}></input>
        <Button loading={loadingDelete}>Delete workspace</Button>
      </form>
    </div>
  );
};
