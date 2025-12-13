'use client';

import React, { useState } from 'react';
import { deleteTemplate, updateTemplate } from './actions';
import Link from 'next/link';
import { TemplateJSON, TemplateRow } from '@/types/types';
import { Button } from '@/components/Button';
import { TemplateJsonInput } from './TemplateJsonInput';
import { TemplateMetaInput } from './TemplateMetaInput';
import { TemplateFieldInput } from './TemplateFieldInput';
import { handleAddField } from './templateHelpers';

export const TemplateContainer = ({
  id,
  workspaceId,
  templateColumn,
  setTemplatesState,
}: {
  id: string;
  workspaceId: string;
  templateColumn: TemplateJSON;
  setTemplatesState: React.Dispatch<React.SetStateAction<TemplateRow[]>>;
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [templateString, setTemplateString] = useState(
    JSON.stringify(templateColumn, null, 2)
  );

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
        <h2>{JSON.parse(templateString).name}</h2>
      </Link>
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
        <TemplateFieldInput workspaceId={workspaceId} />
        <button>Add field</button>
      </form>
      <form
        id={`updateForm${id}`}
        onSubmit={handleUpdateTemplate}
        className='space-y-2'
      >
        <TemplateJsonInput
          templateString={templateString}
          workspaceId={workspaceId}
          setTemplateString={setTemplateString}
        />
      </form>
      <div className='flex space-x-2'>
        <Button form={`updateForm${id}`} loading={loadingUpdate}>
          Update
        </Button>
        <form onSubmit={handleDeleteTemplate}>
          <input hidden readOnly name='id' id='id' value={id}></input>
          <Button loading={loadingDelete}>Delete</Button>
        </form>
      </div>
    </div>
  );
};
