import { DocumentsClient } from './DocumentsClient';
import { addSignedContentToDocuments } from './signDocument';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { DocumentRow, SignedDocumentRow, StorageObject } from '@/types/types';
import { signUrlsAndExtractData } from '../settings/page';
import { initialPage, pageSize } from '@/lib/pagination';
import { SupabaseClient } from '@supabase/supabase-js';

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

  // get first references here
  // get all reference types from the template
  // put them into a set because we only need one of them
  // if reference id doesn't exist in the set, add the documents to the set.
  // set will be indexed by id

  // then handle front end

  // in each field, if type === reference OR if type === array and arrayOf === reference,
  //   add the items of referenceTo to the set
  //
  // once we have the referenceIds, get the first n documents of each from supabase.

  // collect referenceIds

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

  const initialReferencableDocuments = await fetchInitialtReferencableDocuments(
    referenceIds,
    pageSize,
    supabase
  );

  // handle this on front end by templateId

  // let's possibly refactor without prop drilling

  return (
    <DocumentsClient
      documents={documents as SignedDocumentRow[]}
      templateId={templateId}
      template={template?.template}
      workspaceId={workspaceId}
      workspaceName={workspace?.name}
      initialFiles={signedFiles}
      initialReferencableDocuments={initialReferencableDocuments}
    />
  );
};

export default page;

async function fetchInitialtReferencableDocuments(
  templateIds: Set<string>,
  pageSize: number,
  supabase: SupabaseClient
) {
  const results: Record<string, DocumentRow[]> = {};

  for (const templateId of templateIds) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true })
      .limit(pageSize);

    if (error) {
      throw error;
    }

    results[templateId] = data ?? [];
  }

  return results;
}
