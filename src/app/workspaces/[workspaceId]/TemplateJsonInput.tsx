import React from 'react';

export const TemplateJsonInput = ({
  templateString,
  workspaceId,
  setTemplateString,
}: {
  templateString: string;
  workspaceId: string;
  setTemplateString: (value: React.SetStateAction<string>) => void;
}) => {
  return (
    <div>
      <div className='space-x-2'>
        <label>JSON template</label>
        <textarea
          name='template'
          placeholder={'JSON template'}
          className='w-full'
          onChange={(e) => {
            setTemplateString(e.target.value);
          }}
          value={templateString}
        ></textarea>
      </div>
      <input hidden readOnly name='workspaceId' value={workspaceId}></input>
    </div>
  );
};
