import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; documentId: string }> }
) {
  const documentId = (await params).documentId;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const authHeader = req.headers.get('authorization');
  // if no api key, fetch from PUBLIC workspace
  if (!authHeader) {
    const { data, error } = await supabase
      .from('documents')
      .select(
        `
    *,
    workspaces!inner (
      private
    )
  `
      )
      .eq('id', documentId)
      .eq('workspaces.private', false)
      .single();

    if (error)
      new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Not found or workspace is private' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    const apiKey = authHeader.slice('Bearer '.length).trim();

    // going to need to join with the secrets table and what not (all keys have read priveledges)
    // hash the secret key
    // check the hash makes sense
    // read the data
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('id', (await params).documentId);
  }
}
