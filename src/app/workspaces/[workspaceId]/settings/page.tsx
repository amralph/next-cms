import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WorkspaceSettingsClient } from './WorkspaceSettingsClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { SignedFile, StorageObject } from '@/types/types';
import { decrypt } from './helpers';

const page = async ({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) => {
  await getUserOrRedirect('/');

  const workspaceId = (await params).workspaceId;

  const supabase = await createClient();

  const [workspaceData, secretsData, storageData] = await Promise.all([
    supabase
      .from('workspaces')
      .select('id, name, private')
      .eq('id', workspaceId)
      .single(),
    supabase
      .from('secrets')
      .select('id, name, created_at, encryption')
      .eq('workspace_id', workspaceId),
    supabase.rpc('bucket_get_all', {
      bucketid: process.env.SUPABASE_BUCKET!,
      subpath: workspaceId,
      page: 1,
    }),
  ]);

  const workspace = workspaceData.data;

  // redirect if workspace doesn't exist
  // rls handles this
  if (!workspace) redirect('/workspaces');

  // decrypt secrets
  const secrets = secretsData.data || [];
  const decryptedSecrets = secrets.map((secret) => ({
    id: secret.id,
    name: secret.name,
    created_at: secret.created_at,
    secret: decrypt(secret.encryption),
  }));

  const storageObjects = storageData.data as StorageObject[];

  // then sign all files
  const signedFiles = await signUrlsAndExtractData(
    storageObjects,
    supabase,
    process.env.SUPABASE_BUCKET!
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

export async function signUrlsAndExtractData(
  files: StorageObject[],
  supabase: SupabaseClient,
  bucket: string,
  expiresIn: number = 3600
): Promise<SignedFile[]> {
  const fileObjects = await Promise.all(
    files?.map(async (file) => {
      const { data: signedUrlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(file.name, expiresIn);

      return {
        id: file.id,
        filePath: file.name,
        metadata: file.metadata,
        signedUrl: signedUrlData?.signedUrl ?? '',
        originalName: file?.user_metadata.originalName ?? '',
      };
    })
  );

  return fileObjects;
}
