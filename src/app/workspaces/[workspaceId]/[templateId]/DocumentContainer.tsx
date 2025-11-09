'use client';

import React from 'react';
import { deleteDocument, updateDocument } from './actions';
import { JSONValue } from '@/types/extendsRowDataPacket';

export const DocumentContainer = ({
  id,
  workspaceId,
  templateId,
  content,
  jsonTemplate,
}: {
  id: string;
  workspaceId: string;
  templateId: string;
  content: JSONValue[];
  jsonTemplate: JSONValue[];
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
          {Array.isArray(jsonTemplate) && jsonTemplate.length > 0 ? (
            jsonTemplate.map((item, index) => {
              if (
                typeof item !== 'object' ||
                item === null ||
                Array.isArray(item)
              ) {
                return null;
              }

              const key = Object.keys(item)[0];
              const cmsType = item[key];

              // get key from content
              // also get value

              let value: JSONValue = '';

              content.map((contentItem) => {
                if (
                  contentItem &&
                  typeof contentItem === 'object' &&
                  !Array.isArray(contentItem)
                ) {
                  const contentItemKey = Object.keys(contentItem).filter(
                    (key) => key !== 'type'
                  )[0];

                  if (key === contentItemKey) {
                    value = contentItem?.[key];
                  }
                }
              });

              const inputType =
                cmsType === 'string'
                  ? 'text'
                  : cmsType === 'number'
                  ? 'number'
                  : cmsType === 'file'
                  ? 'file'
                  : cmsType === 'boolean'
                  ? 'checkbox'
                  : 'text';

              return (
                <div key={index} className='space-x-2'>
                  <label htmlFor={key}>{key}</label>
                  <input
                    id={key}
                    name={`${cmsType}::${key}`}
                    type={inputType}
                    defaultValue={value}
                  />
                </div>
              );
            })
          ) : (
            <p>Invalid or empty template</p>
          )}
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
