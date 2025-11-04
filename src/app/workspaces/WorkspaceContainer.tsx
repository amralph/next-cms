'use client';

import Link from 'next/link';
import React from 'react';
import { deleteWorkspace } from './actions';

export const WorkspaceContainer = ({
  id,
  name,
}: {
  id: number;
  name: string;
}) => {
  async function handleDeleteWorkspace(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await deleteWorkspace(formData);
  }

  return (
    <div className='border border-white p-2'>
      <Link href={`/workspaces/${id}`}>
        <h2 className='text-xl font-bold'>{name}</h2>
      </Link>
      <form onSubmit={handleDeleteWorkspace}>
        <input hidden readOnly name='id' id='id' value={id}></input>
        <button>Delete</button>
      </form>
    </div>
  );
};
