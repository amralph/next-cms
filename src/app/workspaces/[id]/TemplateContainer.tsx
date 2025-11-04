'use client';

import React from 'react';
import { deleteTemplate } from './actions';

export const TemplateContainer = ({
  id,
  name,
  jsonTemplate,
}: {
  id: number;
  name: string;
  jsonTemplate: string;
}) => {
  async function handleDeleteTemplate(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await deleteTemplate(formData);
  }

  return (
    <div>
      <h2>{name}</h2>
      <p>{JSON.stringify(jsonTemplate)}</p>
      <form onSubmit={handleDeleteTemplate}>
        <input hidden readOnly name='id' id='id' value={id}></input>
        <button>Delete</button>
      </form>
    </div>
  );
};
