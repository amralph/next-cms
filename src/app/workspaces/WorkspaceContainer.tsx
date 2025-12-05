'use client';

import Link from 'next/link';
import { FiSettings } from 'react-icons/fi';

export const WorkspaceContainer = ({
  id,
  name,
  isPrivate,
  createdAt,
}: {
  id: string;
  name: string;
  isPrivate: boolean;
  createdAt: Date;
}) => {
  return (
    <div className='border border-white p-2 space-y-2'>
      <div className='flex items-center justify-between'>
        <Link href={`/workspaces/${id}`}>
          <h2 className='text-xl font-bold my-0!'>{name}</h2>
        </Link>
        <Link href={`/workspaces/${id}/settings`}>
          <FiSettings size={24} />
        </Link>
      </div>
      {isPrivate ? <p>private</p> : <p>public</p>}
      <p>Created at {createdAt.toISOString()}</p>
    </div>
  );
};
