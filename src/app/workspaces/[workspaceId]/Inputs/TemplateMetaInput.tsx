import { TemplateJSON } from '@/types/types';
import React from 'react';

export const TemplateMetaInput = ({
  templateJSON,
  setTemplateJSON,
}: {
  templateJSON: TemplateJSON;
  setTemplateJSON: (value: React.SetStateAction<TemplateJSON>) => void;
}) => {
  return (
    <div className='flex space-x-2 items-center'>
      <div className='space-x-1'>
        <label>Name</label>
        <input
          value={(() => {
            try {
              return typeof templateJSON?.name !== 'undefined'
                ? templateJSON.name
                : '';
            } catch {
              return '';
            }
          })()}
          onChange={(e) => {
            try {
              // Parse the input value as JSON

              const newTemplate = {
                ...templateJSON,
                name: e.target.value,
              };

              setTemplateJSON(newTemplate);
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </div>
      <div className='space-x-1'>
        <label>Key</label>
        <input
          value={(() => {
            try {
              return templateJSON.key;
            } catch {
              return '';
            }
          })()}
          onChange={(e) => {
            try {
              // Parse the input value as JSON

              const newTemplate = {
                ...templateJSON,
                key: e.target.value,
              };

              setTemplateJSON(newTemplate);
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </div>
    </div>
  );
};
