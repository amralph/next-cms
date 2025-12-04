import React from 'react';
import { DocumentsClient } from './DocumentsClient';
import { signUrlsInContentObject } from './SignDocument';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { DocumentRow } from '@/types/document';

const page = async ({
  params,
}: {
  params: Promise<{ templateId: string; workspaceId: string }>;
}) => {
  getUserOrRedirect('/');
  const templateId = (await params).templateId;
  const workspaceId = (await params).workspaceId;

  const supabase = await createClient();

  // get workspace name
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single();

  // Get template
  const { data: template } = await supabase
    .from('templates')
    .select('template')
    .eq('id', templateId)
    .single();

  // Get documents in the workspace
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('template_id', templateId);

  // mutate documents to sign urls
  await Promise.allSettled(
    documents?.map((document) => signUrlsInContentObject(document.content)) ??
      []
  );

  return (
    <DocumentsClient
      documents={documents as DocumentRow[]}
      templateId={templateId}
      template={template?.template}
      workspaceId={workspaceId}
      workspaceName={workspace?.name}
    />
  );
};

export default page;
