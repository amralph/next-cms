import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WorkspaceSettingsClient } from './WorkspaceSettingsClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { StorageObject } from '@/types/types';
import { decrypt } from './helpers';

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
    .select('id, name, private')
    .eq('id', workspaceId)
    .single();

  if (!workspace) redirect('/workspaces');

  // get secrets
  const { data: secrets } = await supabase
    .from('secrets')
    .select('id, name, created_at, encryption')
    .eq('workspace_id', workspaceId);

  const decryptedSecrets =
    secrets?.map((secret) => ({
      id: secret.id,
      name: secret.name,
      created_at: secret.created_at,
      secret: decrypt(secret.encryption),
    })) || null;

  // get list of files
  const bucket = process.env.SUPABASE_BUCKET!;

  const storageObjects = (
    await supabase.rpc('bucket_get_all', {
      bucketid: bucket,
      subpath: workspaceId,
    })
  ).data as StorageObject[];

  // then sign all files
  const signedFiles = await signUrlsAndExtractData(
    storageObjects,
    supabase,
    bucket
  );

  return (
    <WorkspaceSettingsClient
      id={workspace.id}
      name={workspace.name}
      isPrivate={workspace.private}
      signedFiles={signedFiles}
      secrets={decryptedSecrets || []}
    />
  );
};

export default page;

async function signUrlsAndExtractData(
  files: StorageObject[],
  supabase: SupabaseClient,
  bucket: string,
  expiresIn: number = 3600
) {
  const fileObjects = await Promise.all(
    files.map(async (file) => {
      const { data: signedUrlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(file.name, expiresIn);

      return {
        id: file.id,
        filePath: file.name,
        metadata: file.metadata,
        signedUrl: signedUrlData?.signedUrl ?? '',
        originalName: file.user_metadata.originalName ?? '',
      };
    })
  );

  return fileObjects;
}
