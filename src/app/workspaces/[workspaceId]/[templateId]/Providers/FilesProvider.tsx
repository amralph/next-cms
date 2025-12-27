'use client';

import { SignedFile } from '@/types/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { initialPage as _initialPage } from '@/lib/pagination';

// Define the context value type
interface FilesContextType {
  files: SignedFile[];
  setFiles: React.Dispatch<React.SetStateAction<SignedFile[]>>;
  currentFilesPage: number;
  setCurrentFilesPage: React.Dispatch<React.SetStateAction<number>>;
  loadingFiles: boolean;
  setLoadingFiles: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context
const FilesContext = createContext<FilesContextType | null>(null);

// Provider props
interface FilesProviderProps {
  initialFiles?: SignedFile[];
  initialPage?: number;
  children: ReactNode;
}

// Provider component
export function FilesProvider({
  initialFiles = [],
  initialPage = _initialPage,
  children,
}: FilesProviderProps) {
  const [files, setFiles] = useState<SignedFile[]>(initialFiles);
  const [currentFilesPage, setCurrentFilesPage] = useState<number>(initialPage);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  return (
    <FilesContext.Provider
      value={{
        files,
        setFiles,
        currentFilesPage,
        setCurrentFilesPage,
        loadingFiles,
        setLoadingFiles,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
}

// Hook to consume the provider
export function useFilesContext(): FilesContextType {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error('useFiles must be used within a FilesProvider');
  }
  return context;
}
