import React from 'react';

export const TemplateFieldInput = ({
  selectedType,
  selectedArrayType,
  setSelectedType,
  setSelectedArrayType,
}: {
  selectedType: string;
  selectedArrayType: string;
  setSelectedType: (value: React.SetStateAction<string>) => void;
  setSelectedArrayType: (value: React.SetStateAction<string>) => void;
}) => {
  return (
    <div className='flex space-x-2 items-center'>
      <h3 className='font-bold'>Field</h3>
      <div className='space-x-1'>
        <label>Type</label>
        <select
          name='type'
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value='string'>string</option>
          <option value='richText'>richText</option>
          <option value='file'>file</option>
          <option value='boolean'>boolean</option>
          <option value='number'>number</option>
          <option value='date'>date</option>
          <option value='dateTime'>dateTime</option>
          <option value='time'>time</option>
          <option value='reference'>reference</option>
          <option value='array'>array</option>
        </select>
      </div>

      {selectedType === 'array' && (
        <div className='space-x-1'>
          <label>Array of</label>
          <select
            name='arrayOf'
            value={selectedArrayType}
            onChange={(e) => setSelectedArrayType(e.target.value)}
          >
            <option value='string'>string</option>
            <option value='richText'>richText</option>
            <option value='file'>file</option>
            <option value='boolean'>boolean</option>
            <option value='number'>number</option>
            <option value='date'>date</option>
            <option value='dateTime'>dateTime</option>
            <option value='time'>time</option>
            <option value='reference'>reference</option>
          </select>
        </div>
      )}

      <div className='space-x-1'>
        <label>Key</label>
        <input name='key' required></input>
      </div>

      <div className='space-x-1'>
        <label>Name</label>
        <input name='name' required></input>
      </div>

      <div className='space-x-1'>
        <label>Description</label>
        <input name='description'></input>
      </div>
    </div>
  );
};
