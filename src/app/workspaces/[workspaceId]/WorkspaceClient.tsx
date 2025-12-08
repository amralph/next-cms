'use client';

import { FiSettings } from 'react-icons/fi';
import React, { useState } from 'react';
import Breadcrumbs from '../Breadcrumbs';
import { CreateTemplateForm } from './CreateTemplateForm';
import { TemplateContainer } from './TemplateContainer';
import { WorkspaceRow } from '@/types/extendsRowDataPacket';
import { TemplateRow } from '@/types/template';
import Link from 'next/link';

export const WorkspaceClient = ({
  workspace,
  templates,
}: {
  workspace: WorkspaceRow;
  templates: TemplateRow[];
}) => {
  const [templatesState, setTemplatesState] = useState(templates);

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
      <CreateTemplateForm
        workspaceId={workspace.id || ''}
        setTemplatesState={setTemplatesState}
      />
      <div className='space-y-2 '>
        {templatesState.map((template) => (
          <TemplateContainer
            key={template.id}
            id={template.id || ''}
            workspaceId={workspace.id || ''}
            templateColumn={
              template.template || {
                key: '',
                name: '',
                fields: [],
              }
            }
            setTemplatesState={setTemplatesState}
          />
        ))}
      </div>
    </div>
  );
};
