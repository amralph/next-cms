'use client';

import React, { useState } from 'react';
import Breadcrumbs from '../Breadcrumbs';
import { CreateTemplateForm } from './CreateTemplateForm';
import { TemplateContainer } from './TemplateContainer';
import { Workspace } from '@/types/extendsRowDataPacket';
import { TemplateContainer as TemplateContainerType } from '@/types/template';

export const WorkspaceClient = ({
  workspace,
  templates,
}: {
  workspace: Workspace;
  templates: TemplateContainerType[];
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
      <h1>{workspace.name}</h1>
      <CreateTemplateForm
        workspaceId={workspace.id}
        setTemplatesState={setTemplatesState}
      />
      <div className='space-y-2'>
        {templatesState.map((template) => (
          <TemplateContainer
            key={template.id}
            id={template.id}
            workspaceId={workspace.id}
            template={template.template}
            setTemplatesState={setTemplatesState}
          />
        ))}
      </div>
    </div>
  );
};
