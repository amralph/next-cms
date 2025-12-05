'use server';

import { randomUUID, randomBytes, createHash } from 'crypto';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';

export async function createWorkspace(formData: FormData) {
  const user = await getUserOrRedirect('/');
  const name = formData.get('name');

  const workspaceId = randomUUID(); // could probably generate this in supabase
  const secret = randomBytes(32).toString('hex');
  const hashedSecret = createHash('sha256').update(secret).digest('hex');
  const publicKey = randomUUID();

  if (!name) {
    return { success: false, error: 'Missing name' };
  }

  try {
    const supabase = await createClient();

    // probably want to rpc combine this

    const { error: workspacesError } = await supabase
      .from('workspaces')
      .insert({
        id: workspaceId,
        name,
        user_id: user.id, // <-- the Supabase user ID you already have
        secret_hash: hashedSecret,
        public_key: publicKey,
        private: true,
      });

    const { error: workspacesUsersError } = await supabase
      .from('workspaces_users')
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        role: 'admin',
      });

    if (workspacesError || workspacesUsersError) throw Error;

    return {
      success: true,
      result: { name: name, workspaceId: workspaceId },
      secret,
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}
