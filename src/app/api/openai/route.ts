import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { NextRequest } from 'next/server';
import { openai } from '@/lib/openai/client';
import { TemplateRow } from '@/types/types';

export async function POST(req: NextRequest) {
  // this endpoint is for internal application use only
  await getUserOrRedirect('/');

  const { references } = (await req.json()) as {
    references: TemplateRow[];
  };

  const { searchParams } = new URL(req.url);
  const prompt = decodeURI(searchParams.get('prompt') as string);

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: `You generate CMS content templates.

          Rules:
          - Response should be a json object, and ONLY a json object. I should not have to strip
          - response should have the following fields
          key: string
          name: string
          fields: Field[]

          - the type Field has the following fields
          key: string
          name: string
          type: 'string' | 'richText' | 'file'| 'boolean' | 'number' | 'date' | 'dateTime' | 'time' | 'reference' | 'array';
          description?: string
          arrayOf?: same as type, but excludes 'array' (necessary only if type is 'array')
          referenceTo?: string[] (an array of uuid to an existing template. necessary only if type is 'reference' or if arrayOf is 'reference')
          
          - Do not invent new field types
          - Field keys must be camelCase
          - field keys must be unique

          - Provided here are available templates that you could use as a reference
          - Available templates you could reference if appropriate: ${JSON.stringify(
            references
          )}
          - if a field will be a reference to an existing template, then the referenceTo field MUST be the id (a UUID) of that existing template, and not the key or name
          `,
        },
        {
          role: 'user',
          content: `${prompt} `,
        },
      ],
    });

    return new Response(JSON.stringify({ success: true, response: response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (_) {
    return new Response(JSON.stringify({ success: false, error: 'Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
