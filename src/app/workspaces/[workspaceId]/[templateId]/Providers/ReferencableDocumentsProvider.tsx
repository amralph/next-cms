'use client';

import { DocumentRow } from '@/types/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { initialPage as _initialPage } from '@/lib/pagination';

// Define the context value type
interface ReferencableDocumentsContextType {
  referencableDocuments: Record<string, DocumentRow[]>;
  setReferencableDocuments: React.Dispatch<
    React.SetStateAction<Record<string, DocumentRow[]>>
  >;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context
const ReferencableDocumentsContext =
  createContext<ReferencableDocumentsContextType | null>(null);

// Provider props
interface ReferencableDocumentsProviderProps {
  initialReferencableDocuments?: Record<string, DocumentRow[]>;
  initialPage?: number;
  children: ReactNode;
}

// Provider component
export function ReferencableDocumentsProvider({
  initialReferencableDocuments = {},
  initialPage = _initialPage,
  children,
}: ReferencableDocumentsProviderProps) {
  const [referencableDocuments, setReferencableDocuments] = useState<
    Record<string, DocumentRow[]>
  >(initialReferencableDocuments);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <ReferencableDocumentsContext.Provider
      value={{
        referencableDocuments,
        setReferencableDocuments,
        currentPage,
        setCurrentPage,
        loading,
        setLoading,
      }}
    >
      {children}
    </ReferencableDocumentsContext.Provider>
  );
}

// Hook to consume the provider
export function useReferencableDocumentsContext(): ReferencableDocumentsContextType {
  const context = useContext(ReferencableDocumentsContext);
  if (!context) {
    throw new Error(
      'useReferencableDocumentsContext must be used within a ReferencableDocumentsContext'
    );
  }
  return context;
}
