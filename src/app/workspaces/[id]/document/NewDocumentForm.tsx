import React from 'react';
import { TemplateItem } from '@/types/template';

export const NewDocumentForm = ({
  id,
  name,
  jsonTemplate,
}: {
  id: number;
  name: string;
  jsonTemplate: TemplateItem[];
}) => {
  console.log(jsonTemplate);

  return (
    <div className='border border-white p-2 space-y-2'>
      <h2>New {name}</h2>
      <form className='space-y-2'>
        {jsonTemplate.map((item, index) => {
          const key = Object.keys(item)[0];
          const type = item[key];

          const inputType =
            type === 'string'
              ? 'text'
              : type === 'number'
              ? 'number'
              : type === 'image'
              ? 'file'
              : type === 'boolean'
              ? 'checkbox'
              : 'text';

          return (
            <div key={index} className='space-x-2'>
              <label>{key}</label>
              <input type={inputType} name={key} />
            </div>
          );
        })}
      </form>
    </div>
  );
};
