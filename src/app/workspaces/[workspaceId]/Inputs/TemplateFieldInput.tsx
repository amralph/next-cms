import { useState } from 'react';
import { ReferenceToInput } from './ReferenceToInput';
import { FieldWithId } from '../NewTemplate/TemplateData';
import { ArrayFieldType, FieldType } from '@/types/types';

export const TemplateFieldInput = ({
  workspaceId,
  field,
  updateField,
}: {
  workspaceId: string;
  field?: FieldWithId;
  updateField?: (
    value: string | string[],
    fieldId: string,
    inputName: string
  ) => void;
}) => {
  const [selectedType, setSelectedType] = useState(field?.type || 'string');
  const [selectedArrayType, setSelectedArrayType] = useState(
    field && field.type === 'array' ? field?.arrayOf : 'string'
  );

  const [name, setName] = useState(field?.name || '');

  return (
    <div className='space-x-2 items-center space-y-2'>
      <h3 className='font-bold'>{name ? name : 'Add field'}</h3>

      <div className='flex space-x-2'>
        <div className='space-x-1'>
          <label>Name</label>
          <input
            name='name'
            required
            defaultValue={field?.name || ''}
            onChange={(e) => {
              updateField?.(e.target.value, field?.id || '', 'name');
              setName(e.target.value);
            }}
          ></input>
        </div>

        <div className='space-x-1'>
          <label>Key</label>
          <input
            name='key'
            defaultValue={field?.key || ''}
            required
            onChange={(e) =>
              updateField?.(e.target.value, field?.id || '', 'key')
            }
          ></input>
        </div>

        <div className='space-x-1'>
          <label>Description</label>
          <input
            name='description'
            defaultValue={field?.description || ''}
            onChange={(e) =>
              updateField?.(e.target.value, field?.id || '', 'description')
            }
          ></input>
        </div>
      </div>

      <div className='flex space-x-2 items-start'>
        <label>Type</label>
        <select
          name='type'
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value as FieldType);
            updateField?.(e.target.value, field?.id || '', 'type');
          }}
        >
          <option value='string'>string</option>
          <option value='richText'>richText</option>
          <option value='file'>file</option>
          <option value='boolean'>boolean</option>
          <option value='number'>number</option>
          <option value='date'>date</option>
          <option value='dateTime'>dateTime</option>
          <option value='time'>time</option>
          <option value='reference'>reference</option>
          <option value='array'>array</option>
        </select>

        {selectedType === 'reference' && (
          <ReferenceToInput
            field={field}
            workspaceId={workspaceId}
            updateField={updateField}
          ></ReferenceToInput>
        )}

        {selectedType === 'array' && (
          <div className='space-x-1'>
            <label>Array of</label>
            <select
              name='arrayOf'
              value={selectedArrayType}
              onChange={(e) => {
                setSelectedArrayType(e.target.value as ArrayFieldType);
                updateField?.(e.target.value, field?.id || '', 'arrayOf');
              }}
            >
              <option value='string'>string</option>
              <option value='richText'>richText</option>
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

        {selectedType === 'array' && selectedArrayType === 'reference' && (
          <ReferenceToInput
            field={field}
            workspaceId={workspaceId}
            updateField={updateField}
          ></ReferenceToInput>
        )}
      </div>
    </div>
  );
};
