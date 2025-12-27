'use client';

import { createContext, useContext, ReactNode } from 'react';
import { TemplateJSON } from '@/types/types';

// --- Types ---
export type DocumentContextType = {
  workspaceId: string;
  workspaceName: string;
  templateId: string;
  template: TemplateJSON;
};

type DocumentsProviderProps = {
  value: DocumentContextType;
  children: ReactNode;
};

// --- Context ---
const DocumentsPageContext = createContext<DocumentContextType | undefined>(
  undefined
);

// --- Hook ---
export const useDocumentsPageContext = () => {
  const context = useContext(DocumentsPageContext);
  if (!context) {
    throw new Error(
      'useDocumentsPageContext must be used within a DocumentsPageProvider'
    );
  }
  return context;
};

// --- Provider Component ---
export const DocumentsPageProvider = ({
  value,
  children,
}: DocumentsProviderProps) => {
  return (
    <DocumentsPageContext.Provider value={value}>
      {children}
    </DocumentsPageContext.Provider>
  );
};
