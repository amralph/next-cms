import { getUserOrRedirect } from '@/lib/getUserOrRedirect';

import { WorkspacesClient } from './WorkspacesClient';
import { createClient } from '@/lib/supabase/server';
import { WorkspaceRow } from '@/types/extendsRowDataPacket';

const Workspaces = async () => {
  const user = await getUserOrRedirect('/');
  const supabase = await createClient();

  // rpc to get workspaces user is associated with
  const { data: workspaces } = await supabase.rpc('get_user_workspaces', {
    p_user_id: user.id,
  });

  return <WorkspacesClient workspaces={workspaces as WorkspaceRow[]} />;
};

export default Workspaces;
