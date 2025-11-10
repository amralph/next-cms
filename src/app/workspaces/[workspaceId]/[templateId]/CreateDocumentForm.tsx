'use client';

import React from 'react';
import { createDocument } from './actions';
import { Template } from '@/types/template';
import { ArrayInput } from './ArrayInput';

export const CreateDocumentForm = ({
  templateId,
  workspaceId,
  template,
}: {
  templateId: string;
  workspaceId: string;
  template: Template;
}) => {
  async function handleCreateDocument(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await createDocument(formData, templateId, workspaceId);
  }

  return (
    <div className='border border-white p-2 space-y-2'>
      <h2>Create {template.name}</h2>
      <form onSubmit={handleCreateDocument} className='space-y-2'>
        {template.fields.map((field) => {
          if (field.type === 'string') {
            return (
              <div className='space-x-2' key={field.key}>
                <label>{field.name}</label>
                <input type='text' name={`${field.type}::${field.key}`} />
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
                <input type='number' name={`${field.type}::${field.key}`} />
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
                <input type='date' name={`${field.type}::${field.key}`} />
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
                <input type='text' name={`${field.type}::${field.key}`} />
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
                <ArrayInput field={field} />
              </div>
            );
          }
        })}
        <button type='submit'>Create {template.name}</button>
      </form>
    </div>
  );
};
