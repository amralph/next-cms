'use client';

import { useEffect, useState } from 'react';

export const ReferenceToInput = ({ workspaceId }: { workspaceId: string }) => {
  const [availableReferences, setAvailableReferences] = useState<
    { id: string; template: { name: string } }[]
  >([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);

  useEffect(() => {
    async function loadTemplates() {
      const res = await fetch(`/api/workspaces/${workspaceId}/templates`);
      const data = await res.json();
      setAvailableReferences(data.templates || []);
    }

    loadTemplates();
  }, [workspaceId]);

  return (
    <div className='space-y-1'>
      <label>Reference to</label>
      <select
        multiple
        name='referenceTo'
        value={selectedReferences}
        onChange={(e) => {
          const values = Array.from(e.target.selectedOptions).map(
            (o) => o.value
          );
          setSelectedReferences(values);
        }}
      >
        {availableReferences.map((t) => (
          <option key={t.id} value={t.id}>
            {t.template.name}
          </option>
        ))}
      </select>
    </div>
  );
};
