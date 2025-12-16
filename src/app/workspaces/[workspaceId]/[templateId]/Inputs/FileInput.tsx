'use client';

import { useState, useRef, useEffect } from 'react';
import { FileData, SignedFile, SignedReference } from '@/types/types';

interface FileInputProps {
  value: SignedReference;
  name: string;
  files: SignedFile[];
}

export const FileInput = ({ value, name, files }: FileInputProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SignedFile | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<FileData | null>(
    null
  );

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value?._referenceId) return;

    const fetchFile = async () => {
      const encodedFilePath = encodeURIComponent(value._referenceId);

      const res = await fetch(`/api/workspaces/files/${encodedFilePath}`);
      const data = await res.json();

      setUploadedFileInfo(data.data);
    };

    fetchFile();
  }, [value?._referenceId]);

  return (
    <div className='flex flex-col gap-2 text-white rounded-md shadow-md'>
      <label className='font-semibold'>Select or upload a file</label>

      {/* Trigger */}
      <button
        type='button'
        className='border border-gray-700 px-3 py-2 text-left rounded-md bg-gray-900 hover:bg-gray-800 transition-colors'
        onClick={() => setOpen((v) => !v)}
      >
        {selectedFile?.originalName ?? newFile?.name ?? 'Choose uploaded file'}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className='max-h-48 overflow-y-auto border border-gray-700 rounded-md mt-1 bg-gray-900'
        >
          {/* Upload option */}
          <div
            className='px-3 py-2 font-medium cursor-pointer hover:bg-gray-800 transition-colors'
            onClick={() => {
              setSelectedFile(null);
              setNewFile(null);
              setOpen(false);
            }}
          >
            Choose uploaded file
          </div>

          {/* Existing files */}
          {files.map((file) => (
            <div
              key={file.id}
              className='px-3 py-2 cursor-pointer hover:bg-gray-800 transition-colors'
              onClick={() => {
                setSelectedFile(file);
                setNewFile(null);
                setOpen(false);
              }}
            >
              {file.originalName}
            </div>
          ))}
        </div>
      )}

      {/* Upload input */}
      {!selectedFile && (
        <input
          type='file'
          name={`${name}::upload`}
          className='mt-2 text-white'
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setNewFile(e.target.files[0]);
            }
          }}
        />
      )}

      {/* Hidden field for existing file */}
      {selectedFile && (
        <input
          type='hidden'
          name={`${name}::select`}
          value={selectedFile.filePath}
        />
      )}

      {/* Preview for uploaded file */}
      {newFile && (
        <p className='text-sm text-gray-400 mt-1'>
          Selected file: {newFile.name}
        </p>
      )}

      {/* Display fetched file info */}
      {uploadedFileInfo?.metadata?.originalName && (
        <p className='text-sm text-gray-400 mt-1'>
          Uploaded file: {uploadedFileInfo?.metadata?.originalName}
        </p>
      )}

      {value?.__signedUrl ? (
        <a href={value?.__signedUrl} target='_blank' rel='noopener noreferrer'>
          Open file
        </a>
      ) : (
        'Missing file'
      )}
    </div>
  );
};
