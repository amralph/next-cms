'use client';

import React, { useState } from 'react';
import { createTemplate } from './actions';
import { Button } from '@/components/Button';
import { TemplateRow } from '@/types/types';
import { TemplateJsonInput } from './TemplateJsonInput';
import { TemplateFieldInput } from './TemplateFieldInput';
import { TemplateMetaInput } from './TemplateMetaInput';
import { handleAddField } from './templateHelpers';

export const CreateTemplateForm = ({
  workspaceId,
  setTemplatesState,
}: {
  workspaceId: string;
  setTemplatesState: React.Dispatch<React.SetStateAction<TemplateRow[]>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('string');
  const [templateString, setTemplateString] = useState<string>(
    JSON.stringify(
      {
        key: '',
        name: '',
        fields: [],
      },
      null,
      2
    )
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
            template: JSON.parse(result.result.template as string),
          } as TemplateRow,
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
        templateString={templateString}
        setTemplateString={setTemplateString}
      ></TemplateMetaInput>

      <form
        onSubmit={(e) => {
          handleAddField(e, templateString, setTemplateString);
        }}
        className='flex space-x-2 items-center'
      >
        <TemplateFieldInput
          workspaceId={workspaceId}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
        <button>Add field</button>
      </form>

      <form className='space-y-2' onSubmit={handleCreateTemplate}>
        <TemplateJsonInput
          templateString={templateString}
          workspaceId={workspaceId}
          setTemplateString={setTemplateString}
        />
        <Button loading={loading} type='submit'>
          Create
        </Button>
      </form>
    </div>
  );
};
