import { Template } from '@/types/template';
import React from 'react';
import { ArrayInput } from './ArrayInput';
import { Content } from '@/types/extendsRowDataPacket';

export const DocumentFormContents = ({
  template,
  content,
}: {
  template: Template;
  content?: Content;
}) => {
  return (
    <>
      {template.fields.map((field) => {
        if (field.type === 'string') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='text'
                name={`${field.type}::${field.key}`}
                defaultValue={content?.[field.key] as string}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.type === 'number') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='number'
                name={`${field.type}::${field.key}`}
                defaultValue={content?.[field.key] as number}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.type === 'boolean') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='hidden'
                name={`${field.type}::${field.key}`}
                value='false'
              />
              <input
                type='checkbox'
                name={`${field.type}::${field.key}`}
                value='true'
                defaultChecked={content?.[field.key] as boolean}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.type === 'date') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='date'
                name={`${field.type}::${field.key}`}
                defaultValue={content?.[field.key] as string}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.type === 'file') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input type='file' name={`${field.type}::${field.key}`} />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.type === 'reference') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='text'
                name={`${field.type}::${field.key}`}
                defaultValue={content?.[field.key] as string}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }

        if (field.type === 'array') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <ArrayInput
                field={field}
                values={
                  content?.[field.key] as unknown as
                    | string[]
                    | boolean[]
                    | number[]
                }
              />
            </div>
          );
        }
      })}
    </>
  );
};
