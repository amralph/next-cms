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
    const { error } = await supabase.from('workspaces').insert({
      id: workspaceId,
      name,
      user_id: user.id, // <-- the Supabase user ID you already have
      secret_hash: hashedSecret,
      public_key: publicKey,
      private: true,
    });

    if (error) throw error;

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

export async function deleteWorkspace(formData: FormData) {
  const user = await getUserOrRedirect('/');
  const id = formData.get('id');

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updateWorkspace(formData: FormData) {
  const user = await getUserOrRedirect('/');
  const id = formData.get('id');
  const name = formData.get('name');

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workspaces')
      .update({ name })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, result: { id, name } };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updateSecret(formData: FormData) {
  const user = await getUserOrRedirect('/');
  const id = formData.get('id');
  const secret = randomBytes(32).toString('hex');
  const hashedSecret = createHash('sha256').update(secret).digest('hex');

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workspaces')
      .update({ secret_hash: hashedSecret })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return { success: true, secret };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updatePrivate(formData: FormData) {
  const user = await getUserOrRedirect('/');
  const id = formData.get('id');
  const isPrivate = formData.get('private') === 'on' ? true : false;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workspaces')
      .update({ private: isPrivate })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}
