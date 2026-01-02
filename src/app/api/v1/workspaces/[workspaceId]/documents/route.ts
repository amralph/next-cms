import { signValue } from '@/app/workspaces/[workspaceId]/[templateId]/signDocument';
import { decrypt } from '@/app/workspaces/[workspaceId]/settings/helpers';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const workspaceId = (await params).workspaceId;
  const body = (await req.json()) as {
    fields: string[];
    filters: { field: string; operator: string; value: any }[];
  };
  const { fields, filters } = body;

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

  // every field must begin with a ->
  const prefixedFields = fields.map((f) =>
    f.startsWith('content->') ? f : `content->${f}`
  );

  const selectedFields =
    fields[0] === '*' ? 'content' : (prefixedFields.join(',') as '*');

  let query = supabase
    .from('documents')
    .select(`${selectedFields}, workspaces!inner(private)`)
    .eq('workspace_id', workspaceId);

  filters?.forEach((f) => {
    switch (f.operator) {
      case 'eq':
        query = query.eq(f.field, f.value);
        break;
      case 'neq':
        query = query.neq(f.field, f.value);
        break;
      case 'gt':
        query = query.gt(f.field, f.value);
        break;
      case 'gte':
        query = query.gte(f.field, f.value);
        break;
      case 'lt':
        query = query.lt(f.field, f.value);
        break;
      case 'lte':
        query = query.lte(f.field, f.value);
        break;
      case 'like':
        query = query.like(f.field, f.value); // SQL LIKE, % is wildcard
        break;
      case 'ilike':
        query = query.ilike(f.field, f.value); // case-insensitive LIKE
        break;
      case 'is':
        query = query.is(f.field, f.value); // checks IS NULL / IS TRUE / IS FALSE
        break;
      case 'in':
        query = query.in(f.field, f.value); // value must be an array
        break;
      case 'cs': // contains
        query = query.contains(f.field, f.value);
        break;
      case 'cd': // contained by
        query = query.containedBy(f.field, f.value);
        break;
      case 'ov': // overlaps
        query = query.overlaps(f.field, f.value);
        break;
      default:
        console.error(`Unknown operator: ${f.operator}`);
    }
  });

  const { data, error } = await query;

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
  const cleanedData = data.map(({ workspaces, ...rest }) => rest);

  // unwrap from content if select all
  const unwrappedData = cleanedData.map((row: any) => {
    if (fields[0] === '*') {
      // Merge content keys into the row
      return { ...row.content, ...row, content: undefined };
    }
    return row;
  });

  const signedData = await signValue(unwrappedData, supabase);

  return new Response(JSON.stringify({ data: signedData }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
