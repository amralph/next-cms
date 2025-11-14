import { Button } from '@/components/Button';
import React from 'react';

export const TemplateJsonInput = ({
  template,
  workspaceId,
  defaultValue,
  setTemplate,
}: {
  template: string;
  workspaceId: string;
  defaultValue?: string;
  setTemplate: (value: React.SetStateAction<string>) => void;
}) => {
  return (
    <div>
      <div className='space-x-2'>
        <label>JSON template</label>
        <textarea
          name='template'
          placeholder={'JSON template'}
          className='w-full'
          value={(() => {
            try {
              return JSON.stringify(JSON.parse(template), null, 2);
            } catch {
              return template; // if parsing fails, use raw value
            }
          })()}
          onChange={(e) => {
            setTemplate(e.target.value);
          }}
          defaultValue={(() => {
            if (defaultValue) {
              try {
                return JSON.stringify(JSON.parse(defaultValue), null, 2);
              } catch {
                return defaultValue; // if parsing fails, use raw value
              }
            } else {
              return undefined;
            }
          })()}
        ></textarea>
      </div>
      <input hidden readOnly name='workspaceId' value={workspaceId}></input>
    </div>
  );
};
