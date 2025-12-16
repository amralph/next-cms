import { DocumentsClient } from './DocumentsClient';
import { addSignedContentToDocuments } from './signDocument';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { SignedDocumentRow, StorageObject } from '@/types/types';
import { signUrlsAndExtractData } from '../settings/page';
import { initialPage, pageSize } from '@/lib/pagination';

const page = async ({
  params,
}: {
  params: Promise<{ templateId: string; workspaceId: string }>;
}) => {
  getUserOrRedirect('/');
  const templateId = (await params).templateId;
  const workspaceId = (await params).workspaceId;

  const supabase = await createClient();

  // get workspace name
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single();

  // Get template
  const { data: template } = await supabase
    .from('templates')
    .select('template')
    .eq('id', templateId)
    .single();

  // Get documents in the workspace
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('template_id', templateId);

  // mutate documents
  if (documents) await addSignedContentToDocuments(documents);

  // get files

  const bucket = process.env.SUPABASE_BUCKET!;

  const storageObjects = (
    await supabase.rpc('bucket_get_all', {
      bucketid: bucket,
      subpath: workspaceId,
      page: initialPage,
      page_size: pageSize,
    })
  ).data as StorageObject[];

  const signedFiles = await signUrlsAndExtractData(
    storageObjects,
    supabase,
    bucket!
  );

  return (
    <DocumentsClient
      documents={documents as SignedDocumentRow[]}
      templateId={templateId}
      template={template?.template}
      workspaceId={workspaceId}
      workspaceName={workspace?.name}
      initialFiles={signedFiles}
    />
  );
};

export default page;
