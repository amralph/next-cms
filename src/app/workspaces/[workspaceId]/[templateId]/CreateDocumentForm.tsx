'use client';

import React from 'react';
import { createDocument } from './actions';
import { JSONValue } from '@/types/extendsRowDataPacket';

export const CreateDocumentForm = ({
  templateId,
  workspaceId,
  templateName,
  jsonTemplate,
}: {
  templateId: string;
  workspaceId: string;
  templateName: string;
  jsonTemplate: JSONValue[];
}) => {
  async function handleCreateDocument(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    await createDocument(formData, templateId, workspaceId);
  }

  return (
    <div className='border border-white p-2 space-y-2'>
      <h2>Create {templateName}</h2>
      <form onSubmit={handleCreateDocument} className='space-y-2'>
        {Array.isArray(jsonTemplate) && jsonTemplate.length > 0 ? (
          jsonTemplate.map((item, index) => {
            if (
              typeof item !== 'object' ||
              item === null ||
              Array.isArray(item)
            ) {
              return null; // not a valid field descriptor
            }

            const key = Object.keys(item)[0];
            const cmsType = item[key];

            // Map template type to input type
            const inputType =
              cmsType === 'string'
                ? 'text'
                : cmsType === 'number'
                ? 'number'
                : cmsType === 'file'
                ? 'file'
                : cmsType === 'boolean'
                ? 'checkbox'
                : 'text'; // fallback

            return (
              <div key={index} className='space-x-2'>
                <label htmlFor={key}>{key}</label>
                <input id={key} name={`${cmsType}::${key}`} type={inputType} />
              </div>
            );
          })
        ) : (
          <p>Invalid or empty template</p>
        )}
        <button type='submit'>Create {templateName}</button>
      </form>
    </div>
  );
};
