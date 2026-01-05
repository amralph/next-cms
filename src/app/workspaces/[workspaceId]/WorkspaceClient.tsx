'use client';

import { FiSettings } from 'react-icons/fi';
import { useState } from 'react';
import Breadcrumbs from '../Breadcrumbs';
import { WorkspaceRow, TemplateRow, TemplateJSON } from '@/types/types';
import Link from 'next/link';
import {
  TemplateData,
  TemplateJSONWithIdFields,
} from './NewTemplate/TemplateData';
import { Button } from '@/components/Button';
import { createTemplate, deleteTemplate, updateTemplate } from './actions';

export const WorkspaceClient = ({
  workspace,
  templates,
}: {
  workspace: WorkspaceRow;
  templates: TemplateRow[];
}) => {
  const [templatesState, setTemplatesState] = useState(templates);

  async function handleCRDTemplate(
    e: React.FormEvent<HTMLFormElement>,
    action: string,
    id?: string
  ) {
    e.preventDefault();

    if (action === 'create') {
      const formData = new FormData(e.target as HTMLFormElement);
      const result = await createTemplate(formData);

      if (result.success && result.result?.template) {
        setTemplatesState((templates) => {
          return [
            {
              id: result.result?.templateId,
              workspaceId: workspace.id,
              template: JSON.parse(result.result.template as string),
            } as TemplateRow,
            ...templates,
          ];
        });
      } else {
        alert('Error creating template');
      }
    }

    if (action === 'update') {
      const formData = new FormData(e.target as HTMLFormElement);

      const jsonTemplateStr = formData.get('template') as string;
      const templateId = formData.get('templateId') as string;

      const jsonTemplate: TemplateJSONWithIdFields =
        JSON.parse(jsonTemplateStr);

      const clonedTemplate: TemplateJSON = {
        ...jsonTemplate,
        fields: jsonTemplate.fields.map(({ id, ...rest }) => ({ ...rest })),
      };

      const result = await updateTemplate(clonedTemplate, templateId);

      if (!result.success) {
        alert('Error updating template');
      }
    }

    if (action === 'delete' && id) {
      const formData = new FormData(e.target as HTMLFormElement);
      const result = await deleteTemplate(formData);

      if (result.success) {
        setTemplatesState((templates) => {
          return templates.filter((template) => template.id !== id);
        });
      } else {
        alert('Error deleting template');
      }
    }
  }

  return (
    <div className='space-y-2'>
      <Breadcrumbs
        segments={[
          { name: 'Workspaces', id: 'workspaces' },
          { name: `${workspace.name}`, id: `${workspace.id}` },
        ]}
      ></Breadcrumbs>
      <div className='flex align-middle text-center justify-between'>
        <h1 className='my-0!'>{workspace.name}</h1>
        <Link href={`/workspaces/${workspace.id}/settings`}>
          <FiSettings size={24} />
        </Link>
      </div>

      <TemplateData
        workspaceId={workspace.id || ''}
        initialTemplateJSON={{
          key: '',
          name: '',
          fields: [],
        }}
        formEventHandler={handleCRDTemplate}
      >
        {({ loadingCreate } = {}) => (
          <Button loading={loadingCreate} name='action' value='create'>
            Create template
          </Button>
        )}
      </TemplateData>

      <div className='space-y-2 '>
        {templatesState.map((template) => (
          <TemplateData
            key={template.id}
            id={template.id}
            workspaceId={workspace.id || ''}
            initialTemplateJSON={
              template.template || {
                key: '',
                name: '',
                fields: [],
              }
            }
            formEventHandler={handleCRDTemplate}
          >
            {({ loadingUpdate, loadingDelete } = {}) => (
              <div className='flex space-x-2'>
                <Button
                  type='submit'
                  loading={loadingUpdate}
                  name='action'
                  value='update'
                >
                  Update template
                </Button>
                <Button loading={loadingDelete} name='action' value='delete'>
                  Delete template
                </Button>
              </div>
            )}
          </TemplateData>
        ))}
      </div>
    </div>
  );
};
