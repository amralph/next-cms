import { Button } from '@/components/Button';
import { Collaborator, Role } from '@/types/types';
import { useState } from 'react';
import { removeCollaborator } from './actions';

export const UserItem = ({
  role,
  email,
  userId,
  workspaceId,
  createdAt,
  setCollaboratorsState,
}: {
  role: Role;
  email: string;
  userId: string;
  workspaceId: string;
  createdAt: string;
  setCollaboratorsState: React.Dispatch<React.SetStateAction<Collaborator[]>>;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function handleDeleteCollaborator(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await removeCollaborator(formData);

    if (result.success) {
      setCollaboratorsState((prev) => prev.filter((s) => s.user_id !== userId));
    } else {
      alert('Error removing collaborator');
    }

    setLoadingDelete(false);
  }

  return (
    <div className='border border-[#2F3132] rounded-lg p-3 shadow space-y-2'>
      <p>User: {email}</p>
      <p>Role: {role}</p>
      <p>
        Added at:{' '}
        {new Date(createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <form onSubmit={handleDeleteCollaborator}>
        <input hidden readOnly name='userId' value={userId} />
        <input hidden readOnly name='workspaceId' value={workspaceId} />
        <Button loading={loadingDelete}>Remove</Button>
      </form>
    </div>
  );
};
