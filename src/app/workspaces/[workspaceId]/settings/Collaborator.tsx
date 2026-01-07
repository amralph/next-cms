import { Button } from '@/components/Button';
import { Collaborator as CollaboratorType, Role } from '@/types/types';
import { useState } from 'react';
import { removeCollaborator, updateCollaborator } from './actions';

export const Collaborator = ({
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
  setCollaboratorsState: React.Dispatch<
    React.SetStateAction<CollaboratorType[]>
  >;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

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

  async function handleUpdateCollaborator(e: React.FormEvent<HTMLFormElement>) {
    setLoadingUpdate(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateCollaborator(formData);

    if (!result.success) {
      alert('Error updating.');
    } else {
      setCollaboratorsState((prev) =>
        prev.map((c) => {
          return c.user_id === formData.get('userId') || ''
            ? { email, ...result.data }
            : c;
        })
      );
    }

    setLoadingUpdate(false);
  }

  return (
    <div className='border border-[#2F3132] rounded-lg p-3 shadow space-y-2'>
      <form onSubmit={handleUpdateCollaborator} className='space-x-1 space-y-2'>
        <input hidden readOnly name='userId' value={userId} />
        <input hidden readOnly name='workspaceId' value={workspaceId} />
        <p>User: {email}</p>
        <div className='space-x-1'>
          <label>Role: </label>
          <select name='role' id='role' defaultValue={role}>
            <option value='admin'>Admin</option>
            <option value='editor'>Editor</option>
            <option value='viewer'>Viewer</option>
          </select>
        </div>
        <p>
          Added at:{' '}
          {new Date(createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <Button loading={loadingUpdate}>Update</Button>
      </form>
      <form onSubmit={handleDeleteCollaborator}>
        <input hidden readOnly name='userId' value={userId} />
        <input hidden readOnly name='workspaceId' value={workspaceId} />
        <Button loading={loadingDelete}>Remove</Button>
      </form>
    </div>
  );
};
