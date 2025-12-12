import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  // this endpoint is for internal application use only
  await getUserOrRedirect('/');
  const workspaceId = (await params).workspaceId;

  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  // Supabase uses 0-based range
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*') // include row count
      .eq('workspace_id', workspaceId)
      .range(from, to);

    if (error) throw error;

    return new Response(JSON.stringify({ templates }), {
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
