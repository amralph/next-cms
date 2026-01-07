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
        page: 1,
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

export async function addCollaborator(formData: FormData) {
  await getUserOrRedirect('/');
  const email = formData.get('email');
  const workspaceId = formData.get('id');
  const role = formData.get('role');

  try {
    const supabase = await createClient();

    // get user id by email
    const { data: idData, error: idError } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .single();

    if (idError || !idData) throw idError;

    const { error } = await supabase
      .from('workspaces_users')
      .insert({
        user_id: idData.user_id,
        workspace_id: workspaceId,
        role: role,
      })
      .single();
    if (error) throw error;
    return {
      success: true,
      user_id: idData.user_id,
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Error' };
  }
}

export async function removeCollaborator(formData: FormData) {
  await getUserOrRedirect('/');
  const userId = formData.get('userId');
  const workspaceId = formData.get('workspaceId');

  try {
    const supabase = await createClient();

    // must first check if this user is the owner of the workspace
    const { data: isOwner, error: ownerError } = await supabase
      .from('workspaces')
      .select('user_id')
      .eq('user_id', userId)
      .eq('id', workspaceId)
      .limit(1);

    if (ownerError) throw ownerError;

    if (!isOwner.length) {
      const { data, error } = await supabase
        .from('workspaces_users')
        .delete()
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      return {
        success: true,
      };
    }

    throw 'User is owner';
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Error' };
  }
}

export async function updateCollaborator(formData: FormData) {
  await getUserOrRedirect('/');
  const userId = formData.get('userId');
  const workspaceId = formData.get('workspaceId');
  const role = formData.get('role') as string;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('workspaces_users')
      .update({ role: role })
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .select('*')
      .limit(1);

    if (error) throw error;
    if (!data.length) throw 'Could not find user';

    return {
      data: data[0],
      success: true,
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Error' };
  }
}
