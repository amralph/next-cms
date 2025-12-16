import { signUrlsAndExtractData } from '@/app/workspaces/[workspaceId]/settings/page';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { StorageObject } from '@/types/types';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  // internal use only
  await getUserOrRedirect('/');

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? 10);

  //  IMPORTANT: request ONE EXTRA record
  const limit = pageSize + 1;

  const workspaceId = decodeURI((await params).workspaceId);
  const supabase = await createClient();
  const bucket = process.env.SUPABASE_BUCKET!;

  try {
    const result = await supabase.rpc('bucket_get_all', {
      bucketid: bucket,
      subpath: workspaceId,
      page,
      page_size: limit,
    });

    if (result.error) throw result.error;

    const storageObjects = result.data as StorageObject[];

    // hasMore check
    const hasMore = storageObjects.length > pageSize;

    //  Only sign what we actually return
    const pageItems = storageObjects.slice(0, pageSize);

    const signedFiles = await signUrlsAndExtractData(
      pageItems,
      supabase,
      bucket
    );

    return new Response(
      JSON.stringify({
        signedFiles,
        page,
        pageSize,
        hasMore,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
    });
  }
}
