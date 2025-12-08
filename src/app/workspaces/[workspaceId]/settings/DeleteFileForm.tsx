import React, { useState } from 'react';
import { deleteFile } from './actions';
import { Button } from '@/components/Button';
import { signedFile } from './WorkspaceSettingsClient';

const DeleteFileForm = ({
  filePath,
  setFilesState,
}: {
  filePath: string;
  setFilesState: React.Dispatch<React.SetStateAction<signedFile[]>>;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function handleDeleteFile(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await deleteFile(formData);

    if (result.error) {
      alert('Error deleting file.');
    } else {
      setFilesState((prev) =>
        prev.filter(
          (file) => file.filePath !== filePath // keep all except the one to remove
        )
      );
    }

    setLoadingDelete(false);
  }

  return (
    <form onSubmit={handleDeleteFile}>
      <input hidden name='filePath' value={filePath} />
      <Button loading={loadingDelete}>Delete</Button>
    </form>
  );
};

export default DeleteFileForm;
