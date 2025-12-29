import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      documentId: string;
    }>;
  }
) {
  // Internal application use only
  await getUserOrRedirect('/');

  const { workspaceId, documentId } = await params;

  if (!workspaceId) {
    return new Response('workspaceId is required', { status: 400 });
  }

  if (!documentId) {
    return new Response('documentId is required', { status: 400 });
  }

  const supabase = await createClient();

  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('workspace_id', workspaceId)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ document }), {
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
