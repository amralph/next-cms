'use client';

import React, { useState } from 'react';
import { deleteTemplate, updateTemplate } from './actions';
import Link from 'next/link';
import { Template } from '@/types/template';
import { TemplateContainer as TemplateContainerType } from '@/types/template';
import { Button } from '@/components/Button';
import { TemplateJsonInput } from './TemplateJsonInput';
import { TemplateMetaInput } from './TemplateMetaInput';
import { TemplateFieldInput } from './TemplateFieldInput';
import { handleAddField } from './templateHelpers';

export const TemplateContainer = ({
  id,
  workspaceId,
  template,
  setTemplatesState,
}: {
  id: string;
  workspaceId: string;
  template: Template;
  setTemplatesState: React.Dispatch<
    React.SetStateAction<TemplateContainerType[]>
  >;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [templateState, setTemplateState] = useState(JSON.stringify(template));
  const [selectedType, setSelectedType] = useState('string');
  const [selectedArrayType, setSelectedArrayType] = useState('string');

  async function handleUpdateTemplate(e: React.FormEvent<HTMLFormElement>) {
    setLoadingUpdate(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await updateTemplate(formData, id);

    if (!result.success) {
      alert('Error updating template');
    }

    setLoadingUpdate(false);
  }

  async function handleDeleteTemplate(e: React.FormEvent<HTMLFormElement>) {
    setLoadingDelete(true);

    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await deleteTemplate(formData);

    if (result.success) {
      setTemplatesState((templates) => {
        return templates.filter((template) => template.id !== id);
      });
    } else {
      alert('Error deleting template');
    }

    setLoadingDelete(false);
  }

  return (
    <div className='border border-white p-2 space-y-2'>
      <Link href={`/workspaces/${workspaceId}/${id}`}>
        <h2>{template.name}</h2>
      </Link>
      <TemplateMetaInput
        template={templateState}
        setTemplate={setTemplateState}
      ></TemplateMetaInput>
      <form
        onSubmit={(e) => {
          handleAddField(e, templateState, setTemplateState);
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

      <form onSubmit={handleUpdateTemplate} className='space-y-2'>
        <TemplateJsonInput
          template={templateState}
          defaultValue={templateState}
          workspaceId={workspaceId}
          setTemplate={setTemplateState}
        />
        <Button loading={loadingUpdate}>Update</Button>
      </form>
      <form onSubmit={handleDeleteTemplate}>
        <input hidden readOnly name='id' id='id' value={id}></input>
        <Button loading={loadingDelete}>Delete</Button>
      </form>
    </div>
  );
};
