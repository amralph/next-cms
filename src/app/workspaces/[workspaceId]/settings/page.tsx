import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { WorkspaceSettingsClient } from './WorkspaceSettingsClient';

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
    .select('id, name, public_key, private')
    .eq('id', workspaceId)
    .single();

  if (!workspace) redirect('/workspaces');

  return (
    <WorkspaceSettingsClient
      id={workspace.id}
      name={workspace.name}
      publicKey={workspace.public_key}
      isPrivate={workspace.private}
    />
  );
};

export default page;
