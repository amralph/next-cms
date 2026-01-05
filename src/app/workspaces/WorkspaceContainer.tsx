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
    <div className='p-3 space-y-2 bg-[#222425] rounded-lg'>
      <div className='flex items-center justify-between'>
        <Link href={`/workspaces/${id}`}>
          <h2 className='text-xl font-bold my-0!'>{name}</h2>
        </Link>
        <Link href={`/workspaces/${id}/settings`}>
          <FiSettings size={24} />
        </Link>
      </div>
      <p>{isPrivate ? 'private' : 'public'}</p>
      <p>
        Created at{' '}
        {createdAt.toLocaleString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
};
