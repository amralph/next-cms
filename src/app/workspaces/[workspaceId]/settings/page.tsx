import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WorkspaceSettingsClient } from './WorkspaceSettingsClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { StorageObject } from '@/types/extendsRowDataPacket';

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
      publicKey={workspace.public_key}
      isPrivate={workspace.private}
      signedFiles={signedFiles}
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
      console.log(file);

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
