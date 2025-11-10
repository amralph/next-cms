'use client';

import React from 'react';
import { deleteDocument, updateDocument } from './actions';
import { Template } from '@/types/template';
import { Content } from '@/types/extendsRowDataPacket';

export const DocumentContainer = ({
  id,
  workspaceId,
  templateId,
  content,
  template,
}: {
  id: string;
  workspaceId: string;
  templateId: string;
  content: Content;
  template: Template;
}) => {
  async function handleDeleteDocument(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await deleteDocument(formData);
  }

  async function handleUpdateDocument(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await updateDocument(formData, id, templateId, workspaceId);
  }

  return (
    <div className='border border-white p-2 space-y-2 flex'>
      <div>
        <form onSubmit={handleUpdateDocument} className='space-y-2'>
          {template.fields.map((field) => {
            if (field.type === 'string') {
              return (
                <div className='space-x-2' key={field.key}>
                  <label>{field.name}</label>
                  <input
                    type='text'
                    name={`${field.type}::${field.key}`}
                    defaultValue={content[field.key] as string}
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
                    defaultValue={content[field.key] as number}
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
                    defaultChecked={content[field.key] as boolean}
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
                    defaultValue={
                      content[field.key] as string | number | readonly string[]
                    }
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
                  <p>Array idk how to handle</p>
                </div>
              );
            }
          })}

          <button>Update</button>
        </form>
        <form onSubmit={handleDeleteDocument}>
          <input hidden readOnly name='id' id='id' value={id}></input>
          <button>Delete</button>
        </form>
      </div>
    </div>
  );
};
