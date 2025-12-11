import React, { useState } from 'react';
import { deleteSecret } from './actions';
import { Button } from '@/components/Button';

const SecretItem = ({
  id,
  name,
  secret,
  setSecretsState,
}: {
  id: string;
  name: string;
  secret: string;
  setSecretsState: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        name: string;
        created_at: Date;
        secret: string;
      }[]
    >
  >;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function handleDeleteSecret(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await deleteSecret(formData);

    if (result.success) {
      setSecretsState((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert('Error deleting secret');
    }

    setLoadingDelete(false);
  }

  return (
    <div>
      <p>Name: {name}</p>
      <p>Secret: {secret}</p>
      <form onSubmit={handleDeleteSecret}>
        <input hidden readOnly name='id' value={id} />
        <Button loading={loadingDelete}>Delete</Button>
      </form>
    </div>
  );
};

export default SecretItem;
