import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ filePath: string }> }
) {
  // this endpoint is for internal application use only
  await getUserOrRedirect('/');

  const decodedFilePath = decodeURI((await params).filePath);

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .info(decodedFilePath);

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
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
