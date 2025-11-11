'use client';

import React, { useState } from 'react';
import { createTemplate } from './actions';
import { Button } from '@/components/Button';
import { TemplateContainer } from '@/types/template';

export const CreateTemplateForm = ({
  workspaceId,
  setTemplatesState,
}: {
  workspaceId: string;
  setTemplatesState: React.Dispatch<React.SetStateAction<TemplateContainer[]>>;
}) => {
  const [loading, setLoading] = useState(false);

  async function handleCreateTemplate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await createTemplate(formData);

    if (result.success && result.result?.template) {
      setTemplatesState((templates) => {
        return [
          {
            id: result.result?.templateId,
            workspaceId: workspaceId,
            template: JSON.parse(result.result.template),
          } as TemplateContainer,
          ...templates,
        ];
      });
    } else {
      alert('Error creating template');
    }

    setLoading(false);
  }

  const defaultTemplate = { key: '', name: '', fields: [] };

  return (
    <form
      className='space-y-2 border border-white p-2'
      onSubmit={handleCreateTemplate}
    >
      <h2>Create template</h2>
      <div className='space-x-2'>
        <label>JSON template</label>
        <textarea
          name='template'
          placeholder={'JSON template'}
          className='w-full'
          defaultValue={JSON.stringify(defaultTemplate, null, 2)}
        ></textarea>
      </div>
      <input hidden readOnly name='workspaceId' value={workspaceId}></input>
      <Button loading={loading}>Create</Button>
    </form>
  );
};
