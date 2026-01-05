import { TemplateJSON } from '@/types/types';
import React, { useState } from 'react';
import { TemplateFieldInput } from '../Inputs/TemplateFieldInput';
import { TemplateMetaInput } from '../Inputs/TemplateMetaInput';
import { Button } from '@/components/Button';
import { handleAddField } from '../templateHelpers';
import Link from 'next/link';
import { Field } from './Field';
import { Field as FieldType } from '@/types/types';
import { nanoid } from 'nanoid';

export type FieldWithId = FieldType & { id: string };
export type TemplateJSONWithIdFields = {
  key: string;
  name: string;
  fields: FieldWithId[];
};

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
  const templateJSONWithIds = {
    ...initialTemplateJSON,
    fields: initialTemplateJSON.fields.map((field) => ({
      ...field,
      id: nanoid(), // generate a unique ID
    })) as FieldWithId[],
  };

  const [templateJSON, setTemplateJSON] = useState(templateJSONWithIds);
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

  function updateField(
    value: string | string[],
    fieldId: string,
    inputName: string
  ) {
    setTemplateJSON((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, [inputName]: value } : f
      ),
    }));
  }

  return (
    <div className='p-3 space-y-2 bg-[#222425] rounded-lg'>
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
      <form className='flex space-x-2 items-center' onSubmit={addField}>
        <TemplateFieldInput workspaceId={workspaceId}></TemplateFieldInput>
        <Button type='submit' className='max-h-min'>
          Add
        </Button>
      </form>

      <div className='flex flex-col'>
        <span>
          <h3>Fields:</h3>
        </span>

        <ul className='space-y-4'>
          {templateJSON.fields.map((field) => (
            <Field
              key={field.id}
              workspaceId={workspaceId}
              field={field}
              removeField={removeField}
              updateField={updateField}
            ></Field>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          hidden
          value={JSON.stringify(templateJSON)}
          name='template'
          readOnly
        />
        <input hidden value={workspaceId} name='workspaceId' readOnly />
        <input hidden value={id} name='templateId' readOnly />
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
