import { TemplateJSON } from '@/types/types';
import React, { useState } from 'react';
import { TemplateFieldInput } from '../Inputs/TemplateFieldInput';
import { TemplateMetaInput } from '../Inputs/TemplateMetaInput';
import { Button } from '@/components/Button';
import { handleAddField } from '../templateHelpers';
import Link from 'next/link';

export const TemplateData = ({
  initialTemplateJSON,
  workspaceId,
  id,
  formEventHandler,
  children,
}: {
  initialTemplateJSON: TemplateJSON;
  workspaceId: string;
  id?: string;
  formEventHandler: (
    e: React.FormEvent<HTMLFormElement>,
    action: string,
    id?: string
  ) => Promise<void>;
  children: (props?: {
    templateJSON?: TemplateJSON;
    loadingCreate?: boolean;
    loadingUpdate?: boolean;
    loadingDelete?: boolean;
  }) => React.ReactNode;
}) => {
  const [templateJSON, setTemplateJSON] = useState(initialTemplateJSON);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const button = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement;
    const action = button.value;

    try {
      if (action === 'create') setLoadingCreate(true);
      if (action === 'update') setLoadingUpdate(true);
      if (action === 'delete') setLoadingDelete(true);

      await formEventHandler(e, action, id); // call your passed handler
    } finally {
      if (action === 'create') setLoadingCreate(false);
      if (action === 'update') setLoadingUpdate(false);
      if (action === 'delete') setLoadingDelete(false);
    }
  };

  function addField(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleAddField(e, templateJSON, setTemplateJSON);
  }

  function removeField(fieldKey: string) {
    setTemplateJSON((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.key !== fieldKey),
    }));
  }

  return (
    <div className='space-y-2 border border-white p-2'>
      <h2>
        {templateJSON.name ? (
          <Link href={`/workspaces/${workspaceId}/${id}`}>
            {templateJSON.name}
          </Link>
        ) : (
          'New template'
        )}
      </h2>
      <TemplateMetaInput
        templateJSON={templateJSON}
        setTemplateJSON={setTemplateJSON}
      />
      <form className='flex space-x-2' onSubmit={addField}>
        <TemplateFieldInput workspaceId={workspaceId}></TemplateFieldInput>
        <Button type='submit'>Add field</Button>
      </form>

      <div className='flex flex-col'>
        <span>
          <strong>Fields:</strong>
        </span>

        <ul className='space-y-2 ml-2'>
          {templateJSON.fields.map((f) => (
            <div className='flex flex-col border border-white p-2'>
              <span>name: {f.name}</span>
              <span>key: {f.key}</span>
              <span>type: {f.type}</span>
              {f.arrayOf !== undefined && <span>arrayOf: {f.arrayOf}</span>}
              {f.referenceTo !== undefined && (
                <span>referenceTo: {f.referenceTo.join(', ')}</span>
              )}
              {f.description !== undefined && (
                <span>description: {f.description}</span>
              )}
              <Button
                type='button'
                onClick={() => removeField(f.key)}
                className='self-start mt-1'
              >
                Remove
              </Button>
            </div>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <input hidden value={JSON.stringify(templateJSON)} name='template' />
        <input hidden value={workspaceId} name='workspaceId' />
        <input hidden value={id} name='templateId' />
        {children?.({
          templateJSON,
          loadingCreate,
          loadingUpdate,
          loadingDelete,
        })}
      </form>
    </div>
  );
};
