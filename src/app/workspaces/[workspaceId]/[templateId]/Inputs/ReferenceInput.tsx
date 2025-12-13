import { isValidContentJSON } from '@/types/types';
import React, { useEffect, useState } from 'react';

export const ReferenceInput = ({
  name,
  defaultValue,
  workspaceId,
  templateIds,
}: {
  name: string;
  defaultValue?: string;
  workspaceId: string;
  templateIds: string[];
}) => {
  const [documents, setDocuments] = useState<unknown[]>([]);
  const [selectedDocument, setSelectedDocument] = useState(defaultValue);

  // cool, but how can we move this out of this component?
  // we are loading the same data multiple times here...
  useEffect(() => {
    async function loadDocuments() {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents?templateIds=${templateIds.join(
          ','
        )}`
      );
      const data = await res.json();
      setDocuments(data.documents || []);
    }

    loadDocuments();
  }, [workspaceId]);
  return (
    <select
      value={selectedDocument}
      onChange={(e) => setSelectedDocument(e.target.value)}
      name={name}
    >
      <option value=''>Select a document</option>
      {documents.map((doc) => {
        if (isValidContentJSON(doc)) {
          // make the label title or name or the first field in the array or the doc id
          const label =
            doc.content?.title ||
            doc.content?.name ||
            (() => {
              const entries = doc.content ? Object.entries(doc.content) : [];
              const first = entries.find(
                ([key]) => key !== 'title' && key !== 'name'
              );
              return first ? String(first[1]) : undefined;
            })() ||
            doc.id;

          return (
            <option key={doc.id} value={doc.id}>
              {label as string}
            </option>
          );
        }
      })}
    </select>
  );
};
