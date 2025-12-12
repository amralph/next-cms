import { redirect } from 'next/navigation';
import { WorkspaceClient } from './WorkspaceClient';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { TemplateRow } from '@/types/types';

const page = async ({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) => {
  await getUserOrRedirect('/');

  const workspaceId = (await params).workspaceId;

  const supabase = await createClient();
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('id', workspaceId)
    .single();

  if (!workspace) redirect('/workspaces');

  // get templates that only belong to this workspace
  // rls will cover who is allowed to see it
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('workspace_id', workspaceId);

  return (
    <WorkspaceClient
      templates={templates as TemplateRow[]}
      workspace={workspace}
    />
  );
};

export default page;
