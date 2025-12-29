'use client';

import { SignedFile } from '@/types/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { initialPage as _initialPage } from '@/lib/pagination';

// Define the context value type
interface FilesContextType {
  files: SignedFile[];
  setFiles: React.Dispatch<React.SetStateAction<SignedFile[]>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <FilesContext.Provider
      value={{
        files,
        setFiles,
        currentPage,
        setCurrentPage,
        loading,
        setLoading,
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
    throw new Error('useFilesContext must be used within a FilesProvider');
  }
  return context;
}
