'use client';

import { useState } from 'react';
import { SignedFile } from '@/types/types';

interface FileInputProps {
  value: string;
  name: string;
  files: SignedFile[];
}

export const FileInput = ({ name, files, value }: FileInputProps) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFileId(value);
    setNewFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
      setSelectedFileId(null);
    }
  };

  const selectedFile = files?.find((f) => f.id === selectedFileId);

  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={name}>Select or upload a file:</label>

      {/* Dropdown to select existing file */}
      <select
        defaultValue={value}
        name={`${name}::select`}
        onChange={handleSelectChange}
      >
        <option value=''>-- Select an existing file --</option>
        {files?.map((file) => (
          <option key={file.filePath} value={file.filePath}>
            {file.originalName}
          </option>
        ))}
      </select>

      {/* Show file input only if no existing file is selected */}
      {!selectedFile && (
        <input
          type='file'
          name={`${name}::upload`}
          onChange={handleFileChange}
        />
      )}

      {/* Show text input if user selected an existing file */}
      {selectedFile && (
        <input
          type='text'
          name={name}
          value={selectedFile.originalName}
          readOnly
          hidden
        />
      )}

      {/* Optional: show preview of newly selected file */}
      {newFile && <p>Selected file to upload: {newFile.name}</p>}
    </div>
  );
};
