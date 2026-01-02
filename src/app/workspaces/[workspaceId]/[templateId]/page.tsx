import { DocumentsClient } from './DocumentsClient';
import { addSignedContentToDocuments } from './signDocument';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { SignedDocumentRow, StorageObject } from '@/types/types';
import { signUrlsAndExtractData } from '../settings/page';
import { initialPage, pageSize } from '@/lib/pagination';
import { DocumentsPageProvider } from './Providers/DocumentsPageProvider';
import { FilesProvider } from './Providers/FilesProvider';
import { ReferencableDocumentsProvider } from './Providers/ReferencableDocumentsProvider';
import { fetchReferencableDocuments } from './referencableDocuments';

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

  // Get documents in the workspace that are part of this template
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('template_id', templateId);

  // mutate documents
  if (documents) await addSignedContentToDocuments(documents, supabase);

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

  const referenceIds = new Set<string>();

  for (const field of template?.template.fields) {
    if (
      field.type === 'reference' ||
      (field.type === 'array' && field.arrayOf === 'reference')
    ) {
      for (const refId of field.referenceTo ?? []) {
        referenceIds.add(refId);
      }
    }
  }

  const initialReferencableDocuments = await fetchReferencableDocuments(
    referenceIds,
    initialPage,
    pageSize,
    supabase
  );

  // handle this on front end by templateId

  // create a references provider for initialReferencableDocuments
  return (
    <DocumentsPageProvider
      value={{
        workspaceId,
        workspaceName: workspace?.name,
        templateId,
        template: template?.template,
      }}
    >
      <FilesProvider initialFiles={signedFiles} initialPage={initialPage}>
        <ReferencableDocumentsProvider
          initialReferencableDocuments={initialReferencableDocuments}
          initialPage={initialPage}
        >
          <DocumentsClient documents={documents as SignedDocumentRow[]} />
        </ReferencableDocumentsProvider>
      </FilesProvider>
    </DocumentsPageProvider>
  );
};

export default page;
