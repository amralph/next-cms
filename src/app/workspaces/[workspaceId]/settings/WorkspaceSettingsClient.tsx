'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  deleteWorkspace,
  updateWorkspace,
  updatePrivate,
  createSecret,
} from './actions';
import { Button } from '@/components/Button';
import Spinner from '@/components/Spinner';
import { redirect } from 'next/navigation';
import Breadcrumbs from '../../Breadcrumbs';
import DeleteFileForm from './DeleteFileForm';
import SecretItem from './SecretItem';
import { SignedFile } from '@/types/types';

export const WorkspaceSettingsClient = ({
  id,
  name,
  isPrivate,
  signedFiles,
  secrets,
}: {
  id: string;
  name: string;
  isPrivate: boolean;
  signedFiles: SignedFile[];
  secrets: { id: string; name: string; created_at: Date; secret: string }[];
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [loadingTogglePrivate, setLoadingTogglePrivate] = useState(false);
  const [filesState, setFilesState] = useState(signedFiles);
  const [secretsState, setSecretsState] = useState(secrets);

  async function handleDeleteWorkspace(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await deleteWorkspace(formData);

    if (!result.success) {
      alert('Error deleting');
    } else {
      redirect('/workspaces');
    }

    setLoadingDelete(false);
  }

  async function handleUpdateWorkspace(e: React.FormEvent<HTMLFormElement>) {
    setLoadingUpdate(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateWorkspace(formData);

    if (!result.success) {
      alert('Error updating.');
    }

    setLoadingUpdate(false);
  }

  async function handleGenerateSecret(e: React.FormEvent<HTMLFormElement>) {
    setLoadingSecret(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await createSecret(formData);

    if (result.success && result.data) {
      setSecretsState((prev) => [result.data, ...prev]);
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
    <div className=' space-y-4'>
      <Breadcrumbs
        segments={[
          { name: 'Workspaces', id: 'workspaces' },
          { name: name, id: id },
          { name: 'Settings', id: 'settings' },
        ]}
      ></Breadcrumbs>
      <div className='space-y-2'>
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
        <form onSubmit={handleDeleteWorkspace}>
          <input hidden readOnly name='id' value={id}></input>
          <Button loading={loadingDelete}>Delete workspace</Button>
        </form>
        <h2>Secrets</h2>
        <div className='border border-white p-2 space-y-2'>
          {secretsState?.length > 0 && (
            <div className='border border-white p-2 space-y-2'>
              {secretsState?.map((s) => (
                <SecretItem
                  key={s.id}
                  id={s.id}
                  name={s.name}
                  secret={s.secret}
                  setSecretsState={setSecretsState}
                ></SecretItem>
              ))}
            </div>
          )}

          <form onSubmit={handleGenerateSecret} className='space-y-2'>
            <input hidden readOnly name='id' value={id}></input>
            <div className='space-x-2'>
              <label>Secret key name</label>
              <input name='name'></input>
            </div>

            <Button loading={loadingSecret}>Generate new secret</Button>
          </form>
        </div>
      </div>
      <h2>Files</h2>
      <div className='border border-white p-2'>
        {filesState?.length > 0 ? (
          <div className='space-y-2 border border-white p-2'>
            {filesState?.map((file) => (
              <div key={file.id} className='space-y-1 border border-white p-2'>
                <h3>
                  <a href={file.signedUrl} target='_blank'>
                    {file.originalName}
                  </a>
                </h3>

                <p>Size: {file.metadata.size} bytes</p>

                <DeleteFileForm
                  filePath={file.filePath}
                  setFilesState={setFilesState}
                ></DeleteFileForm>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>No files in workspace</p>
          </div>
        )}
      </div>
    </div>
  );
};
