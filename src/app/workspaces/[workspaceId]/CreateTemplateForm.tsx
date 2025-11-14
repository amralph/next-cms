'use client';

import React, { useState } from 'react';
import { createTemplate } from './actions';
import { Button } from '@/components/Button';
import { TemplateContainer } from '@/types/template';
import { TemplateJsonInput } from './TemplateJsonInput';
import { TemplateFieldInput } from './TemplateFieldInput';
import { TemplateMetaInput } from './TemplateMetaInput';
import { handleAddField } from './templateHelpers';

export const CreateTemplateForm = ({
  workspaceId,
  setTemplatesState,
}: {
  workspaceId: string;
  setTemplatesState: React.Dispatch<React.SetStateAction<TemplateContainer[]>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('string');
  const [selectedArrayType, setSelectedArrayType] = useState('string');
  const [template, setTemplate] = useState(
    JSON.stringify({ key: '', name: '', fields: [] })
  );

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

  return (
    <div className='border border-white p-2'>
      <h2>Create template</h2>
      <TemplateMetaInput
        template={template}
        setTemplate={setTemplate}
      ></TemplateMetaInput>

      <form
        onSubmit={(e) => {
          handleAddField(e, template, setTemplate);
        }}
        className='flex space-x-2 items-center'
      >
        <TemplateFieldInput
          selectedType={selectedType}
          selectedArrayType={selectedArrayType}
          setSelectedType={setSelectedType}
          setSelectedArrayType={setSelectedArrayType}
        />
        <button>Add field</button>
      </form>

      <form className='space-y-2' onSubmit={handleCreateTemplate}>
        <TemplateJsonInput
          template={template}
          workspaceId={workspaceId}
          setTemplate={setTemplate}
        />
        <Button loading={loading} type='submit'>
          Create
        </Button>
      </form>
    </div>
  );
};
