import React from 'react';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';

import { WorkspacesClient } from './WorkspacesClient';
import { createClient } from '@/lib/supabase/server';
import { WorkspaceRow } from '@/types/extendsRowDataPacket';

const Workspaces = async () => {
  const user = await getUserOrRedirect('/');
  const supabase = await createClient();

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, name, created_at, public_key, private')
    .eq('user_id', user.id);

  return <WorkspacesClient workspaces={workspaces as WorkspaceRow[]} />;
};

export default Workspaces;
