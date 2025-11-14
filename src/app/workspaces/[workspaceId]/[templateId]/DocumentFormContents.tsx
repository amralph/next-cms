import { Template } from '@/types/template';
import React from 'react';
import { ArrayInput } from './ArrayInput';
import { Content } from '@/types/extendsRowDataPacket';
import { RichTextArea } from '@/components/RichTextArea';

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
                defaultValue={
                  typeof content?.[field.key] === 'string'
                    ? String(content[field.key])
                    : undefined
                }
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'richText') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <RichTextArea
                name={`${field.type}::${field.key}`}
                defaultValue={
                  typeof content?.[field.key] === 'string'
                    ? String(content[field.key])
                    : undefined
                }
              ></RichTextArea>
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'number') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='number'
                name={`${field.type}::${field.key}`}
                defaultValue={
                  typeof content?.[field.key] === 'number'
                    ? Number(content?.[field.key])
                    : undefined
                }
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'boolean') {
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
                defaultChecked={Boolean(content?.[field.key])}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'date') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='date'
                name={`${field.type}::${field.key}`}
                defaultValue={String(content?.[field.key])}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'time') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='time'
                name={`${field.type}::${field.key}`}
                defaultValue={String(content?.[field.key])}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'dateTime') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='datetime-local'
                name={`${field.type}::${field.key}`}
                defaultValue={String(content?.[field.key])}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'file') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input type='file' name={`${field.type}::${field.key}`} />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}

              {content?.[field.key] && (
                <a
                  href={(() => {
                    const value = content?.[field.key];

                    if (
                      value &&
                      !Array.isArray(value) &&
                      typeof value === 'object' &&
                      value._type === 'reference'
                    ) {
                      return value._referenceId;
                    }

                    return undefined;
                  })()}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Open file
                </a>
              )}
            </div>
          );
        } else if (field.type === 'reference') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <input
                type='text'
                name={`${field.type}::${field.key}`}
                defaultValue={(() => {
                  const value = content?.[field.key];
                  if (
                    value &&
                    typeof value === 'object' &&
                    !Array.isArray(value) &&
                    value._type === 'reference'
                  ) {
                    return value._referenceId;
                  } else {
                    return undefined;
                  }
                })()}
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        } else if (field.type === 'array') {
          return (
            <div className='space-x-2' key={field.key}>
              <label>{field.name}</label>
              <ArrayInput
                field={field}
                values={
                  Array.isArray(content?.[field.key])
                    ? (content?.[field.key] as Content[])
                    : []
                }
              />
              {field.description && (
                <p className='text-xs'>{field.description}</p>
              )}
            </div>
          );
        }
      })}
    </>
  );
};
