import { fetchReferencableDocuments } from '@/app/workspaces/[workspaceId]/[templateId]/referencableDocuments';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { pageSize } from '@/lib/pagination';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  // this endpoint is for internal application use only
  await getUserOrRedirect('/');
  const workspaceId = (await params).workspaceId;

  if (!workspaceId) {
    return new Response('workspaceId is required', { status: 400 });
  }

  const templateIdsParam = req.nextUrl.searchParams.get('templateIds');
  if (!templateIdsParam) {
    return new Response('templateIds are required', { status: 400 });
  }

  const templateIds = templateIdsParam.split(',').map((id) => id.trim());

  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || pageSize;

  // Supabase uses 0-based range

  try {
    const documents = await fetchReferencableDocuments(
      new Set(templateIds),
      page,
      limit,
      supabase
    );

    return new Response(JSON.stringify({ documents }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (_) {
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
