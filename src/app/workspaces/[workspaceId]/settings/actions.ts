'use server';

import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { StorageObject } from '@/types/extendsRowDataPacket';
import { createHash, randomBytes } from 'crypto';

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

    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove(pathsToDelete);

    if (removeError) throw removeError;

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
