'use client';

import { useState, useRef, useEffect } from 'react';
import { FileData, SignedFile, SignedReference } from '@/types/types';
import { pageSize } from '@/lib/pagination';
import { useDocumentsPageContext } from '../Providers/DocumentsPageProvider';
import { useFilesContext } from '../Providers/FilesProvider';

interface FileInputProps {
  value: SignedReference;
  name: string;
}

export const FileInput = ({ value, name }: FileInputProps) => {
  const { workspaceId } = useDocumentsPageContext();

  const { files, setFiles, currentPage, setCurrentPage, loading, setLoading } =
    useFilesContext();

  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SignedFile | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<FileData | null>(
    null
  );

  const [hasMoreFiles, setHasMoreFiles] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);

  const loadMoreFiles = async () => {
    if (loading || !hasMoreFiles) return;

    setLoading(true);

    try {
      const nextPage = currentPage + 1;

      const res = await fetch(
        `/api/workspaces/${workspaceId}/files?page=${nextPage}&pageSize=${pageSize}`
      );

      const data = await res.json();

      setFiles((prev) => [...prev, ...data.signedFiles]);
      setCurrentPage(nextPage);
      setHasMoreFiles(data.hasMore);
    } finally {
      setLoading(false);
    }
  };

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

          {/* Load more button */}
          {hasMoreFiles && (
            <button
              type='button'
              onClick={loadMoreFiles}
              disabled={loading}
              className='w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50'
            >
              {loading ? 'Loading…' : 'Load more files'}
            </button>
          )}

          {!hasMoreFiles && (
            <div className='px-3 py-2 text-sm text-gray-500 text-center'>
              No more files
            </div>
          )}
        </div>
      )}

      {/* Upload input */}
      <input
        type='file'
        name={newFile ? `${name}::upload` : undefined}
        className='mt-2 text-white'
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setNewFile(e.target.files[0]);
            setSelectedFile(null);
          }
        }}
      />

      {/* Basically, only submit this if user selected an existing file or if this file comes from a previous load AND there is no new file */}
      <input
        type='hidden'
        name={
          (selectedFile || value?._referenceId) && !newFile
            ? `${name}::select`
            : undefined
        }
        value={selectedFile?.filePath || value?._referenceId}
      />

      {/* Preview for uploaded file */}
      {newFile && (
        <p className='text-sm text-gray-400 mt-1'>
          Selected file: {newFile.name}
        </p>
      )}

      {/* Display fetched file info */}
      {uploadedFileInfo?.metadata?.originalName && (
        <p className='text-sm text-gray-400 mt-1'>
          Uploaded file: {uploadedFileInfo.metadata.originalName}
        </p>
      )}

      {value?.__signedUrl ? (
        <a href={value.__signedUrl} target='_blank' rel='noopener noreferrer'>
          Open file
        </a>
      ) : (
        'Missing file'
      )}
    </div>
  );
};
