import { TemplateJSON } from '@/types/template';
import React from 'react';

export const TemplateJsonInput = ({
  template,
  workspaceId,
  defaultValue,
  setTemplate,
}: {
  template: TemplateJSON;
  workspaceId: string;
  defaultValue?: TemplateJSON;
  setTemplate: (value: React.SetStateAction<TemplateJSON>) => void;
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
            return JSON.stringify(template, null, 2);
          })()}
          onChange={(e) => {
            setTemplate(JSON.parse(e.target.value));
          }}
          defaultValue={(() => {
            if (defaultValue) {
              return JSON.stringify(defaultValue, null, 2);
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
