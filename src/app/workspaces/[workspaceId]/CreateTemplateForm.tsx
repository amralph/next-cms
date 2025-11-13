'use client';

import React, { useState } from 'react';
import { createTemplate } from './actions';
import { Button } from '@/components/Button';
import { FieldType, TemplateContainer } from '@/types/template';

type Field = {
  key: string;
  name: string;
  description?: string;
  type: FieldType;
  arrayOf?: Exclude<FieldType, 'array'>;
};

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
  const [template, setTemplate] = useState<{
    key: string;
    name: string;
    fields: Field[];
  }>({ key: '', name: '', fields: [] });

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

  function handleAddField(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as Field;

    if (data.description === '') {
      delete data.description;
    }

    const newTemplate = {
      ...template,
      fields: [...template.fields, data],
    };

    setTemplate(newTemplate);
  }

  return (
    <div className='border border-white p-2'>
      <div className='flex space-x-2'>
        <div className='space-x-1'>
          <label>Key</label>
          <input
            onChange={(e) =>
              setTemplate((template) => ({
                ...template, // keep all other properties
                key: e.target.value, // update the `key` property
              }))
            }
          />
        </div>
        <div className='space-x-1'>
          <label>Name</label>
          <input
            onChange={(e) =>
              setTemplate((template) => ({
                ...template, // keep all other properties
                name: e.target.value, // update the `key` property
              }))
            }
          />
        </div>
      </div>

      <form onSubmit={handleAddField} className='flex space-x-2 items-center'>
        <div className='space-x-1'>
          <label>Type</label>
          <select
            name='type'
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value='string'>string</option>
            <option value='file'>file</option>
            <option value='boolean'>boolean</option>
            <option value='number'>number</option>
            <option value='date'>date</option>
            <option value='dateTime'>dateTime</option>
            <option value='time'>time</option>
            <option value='reference'>reference</option>
            <option value='array'>array</option>
          </select>
        </div>

        <div className='space-x-1'>
          <label>Key</label>
          <input name='key'></input>
        </div>

        <div className='space-x-1'>
          <label>Name</label>
          <input name='name'></input>
        </div>

        <div className='space-x-1'>
          <label>Description</label>
          <input name='description'></input>
        </div>

        {selectedType === 'array' && (
          <div className='space-x-1'>
            <label>Array of</label>
            <select
              name='arrayOf'
              value={selectedArrayType}
              onChange={(e) => setSelectedArrayType(e.target.value)}
            >
              <option value='string'>string</option>
              <option value='file'>file</option>
              <option value='boolean'>boolean</option>
              <option value='number'>number</option>
              <option value='date'>date</option>
              <option value='dateTime'>dateTime</option>
              <option value='time'>time</option>
              <option value='reference'>reference</option>
            </select>
          </div>
        )}

        <button>Add field</button>
      </form>

      <form className='space-y-2 ' onSubmit={handleCreateTemplate}>
        <h2>Create template</h2>
        <div className='space-x-2'>
          <label>JSON template</label>
          <textarea
            name='template'
            placeholder={'JSON template'}
            className='w-full'
            value={JSON.stringify(template, null, 2)}
          ></textarea>
        </div>
        <input hidden readOnly name='workspaceId' value={workspaceId}></input>
        <Button loading={loading}>Create</Button>
      </form>
    </div>
  );
};
