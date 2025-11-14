import React from 'react';

export const TemplateMetaInput = ({
  template,
  setTemplate,
}: {
  template: string;
  setTemplate: (value: React.SetStateAction<string>) => void;
}) => {
  return (
    <div className='flex space-x-2'>
      <div className='space-x-1'>
        <label>Key</label>
        <input
          value={(() => {
            try {
              const parsedTemplate = JSON.parse(template);
              return typeof parsedTemplate?.key !== 'undefined'
                ? parsedTemplate.key
                : '';
            } catch {
              return '';
            }
          })()}
          onChange={(e) => {
            try {
              // Parse the input value as JSON
              const parsedTemplate = JSON.parse(template);

              const newTemplate = {
                ...parsedTemplate,
                key: e.target.value,
              };

              setTemplate(JSON.stringify(newTemplate));
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </div>
      <div className='space-x-1'>
        <label>Name</label>
        <input
          value={(() => {
            try {
              const parsedTemplate = JSON.parse(template);
              return typeof parsedTemplate?.name !== 'undefined'
                ? parsedTemplate.name
                : '';
            } catch {
              return '';
            }
          })()}
          onChange={(e) => {
            try {
              // Parse the input value as JSON
              const parsedTemplate = JSON.parse(template);

              const newTemplate = {
                ...parsedTemplate,
                name: e.target.value,
              };

              setTemplate(JSON.stringify(newTemplate));
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </div>
    </div>
  );
};
