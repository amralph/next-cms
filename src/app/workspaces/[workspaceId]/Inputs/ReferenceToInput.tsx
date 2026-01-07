'use client';

import { useEffect, useState } from 'react';
import { FieldWithId } from '../NewTemplate/TemplateData';

export const ReferenceToInput = ({
  workspaceId,
  field,
  updateField,
}: {
  workspaceId: string;
  field?: FieldWithId;
  updateField?: (
    value: string | string[],
    fieldId: string,
    inputName: string
  ) => void;
}) => {
  const [availableReferences, setAvailableReferences] = useState<
    { id: string; template: { name: string } }[]
  >([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>(
    field && field.type === 'reference' ? field?.referenceTo : []
  );

  useEffect(() => {
    async function loadTemplates() {
      const res = await fetch(`/api/workspaces/${workspaceId}/templates`);
      const data = await res.json();
      setAvailableReferences(data.templates || []);
    }

    loadTemplates();
  }, [workspaceId]);

  return (
    <div className='space-x-2 flex items-start'>
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
          updateField?.(values, field?.id || '', 'referenceTo');
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
