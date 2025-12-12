'use server';

import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { StorageObject } from '@/types/types';
import { randomBytes } from 'crypto';
import { encrypt } from './helpers';

export async function deleteWorkspace(formData: FormData) {
  const user = await getUserOrRedirect('/');
  const workspaceId = formData.get('id');

  try {
    const supabase = await createClient();

    const bucket = process.env.SUPABASE_BUCKET!;

    // delete folders first because deleting workspace will cause us to lose access via join table deletion
    const storageObjects = (
      await supabase.rpc('bucket_get_all', {
        bucketid: bucket,
        subpath: workspaceId,
      })
    ).data as StorageObject[];

    const pathsToDelete = storageObjects?.map((so) => so.name);

    if (pathsToDelete.length) {
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(pathsToDelete);

      if (removeError) throw removeError;
    }

    const { error: databaseError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId)
      .eq('user_id', user.id);

    if (databaseError) throw databaseError;

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

export async function createSecret(formData: FormData) {
  await getUserOrRedirect('/');
  const name = formData.get('name');
  const workspaceId = formData.get('id');
  const secret = randomBytes(32).toString('hex');

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('secrets')
      .insert({
        encryption: encrypt(secret),
        workspace_id: workspaceId,
        name: name,
      })
      .select('id, workspace_id, name, created_at')
      .single();
    if (error) throw error;
    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        workspace_id: data.workspace_id,
        created_at: data.created_at,
        secret: secret,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function deleteSecret(formData: FormData) {
  await getUserOrRedirect('/');
  const secretId = formData.get('id');

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('secrets')
      .delete()
      .eq('id', secretId);

    if (error) throw error;

    return {
      success: true,
    };
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

export async function deleteFile(formData: FormData) {
  await getUserOrRedirect('/');
  const filePath = formData.get('filePath')?.toString();

  const supabase = await createClient();

  try {
    if (!filePath) {
      throw Error('No file path');
    }

    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Error deleting file' };
  }
}
