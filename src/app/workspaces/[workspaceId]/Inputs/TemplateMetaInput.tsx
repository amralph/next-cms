import React from 'react';

export const TemplateMetaInput = ({
  templateString,
  setTemplateString,
}: {
  templateString: string;
  setTemplateString: (value: React.SetStateAction<string>) => void;
}) => {
  return (
    <div className='flex space-x-2 items-center'>
      <h3 className='font-bold'>Template</h3>
      <div className='space-x-1'>
        <label>Key</label>
        <input
          value={(() => {
            try {
              const parsedTemplate = JSON.parse(templateString);

              return parsedTemplate.key;
            } catch {
              return '';
            }
          })()}
          onChange={(e) => {
            try {
              // Parse the input value as JSON
              const parsedTemplate = JSON.parse(templateString);

              const newTemplate = {
                ...parsedTemplate,
                key: e.target.value,
              };

              setTemplateString(JSON.stringify(newTemplate, null, 2));
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
              const parsedTemplate = JSON.parse(templateString);
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
              const parsedTemplate = JSON.parse(templateString);

              const newTemplate = {
                ...parsedTemplate,
                name: e.target.value,
              };

              setTemplateString(JSON.stringify(newTemplate, null, 2));
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </div>
    </div>
  );
};
