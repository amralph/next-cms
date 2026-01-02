import { signValue } from '@/app/workspaces/[workspaceId]/[templateId]/signDocument';
import { decrypt } from '@/app/workspaces/[workspaceId]/settings/helpers';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; documentId: string }> }
) {
  const documentId = (await params).documentId;
  const workspaceId = (await params).workspaceId;

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

  const { data, error } = await supabase
    .from('documents')
    .select('*, workspaces!inner(private)')
    .eq('id', documentId)
    .eq('workspace_id', workspaceId)
    .limit(1);

  if (error) {
    return new Response(JSON.stringify({ error: 'Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!data.length)
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });

  // check if data is private
  if (data[0].workspaces.private) {
    const apiKey = authHeader?.slice('Bearer '.length).trim();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: secretData, error: secretError } = await supabase
      .from('secrets')
      .select('encryption')
      .eq('workspace_id', workspaceId);

    if (secretError) {
      return new Response(JSON.stringify({ error: 'Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decryptions = secretData.map((d) => decrypt(d.encryption));

    if (!decryptions.includes(apiKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // remove workspaces from the data
  const { workspaces, ...dataWithoutWorkspace } = data[0];

  const signedData = await signValue(dataWithoutWorkspace.content, supabase);

  return new Response(JSON.stringify({ data: signedData }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
