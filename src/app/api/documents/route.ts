import { NextRequest } from 'next/server';
import { createHash, randomUUID } from 'crypto';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// create new document
export async function POST(req: NextRequest) {
  try {
    // get api key
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const apiKey = authHeader.slice('Bearer '.length).trim();

    // get body
    const body = await req.json();

    const workspaceId = body.workspaceId;
    const templateId = body.templateId;
    const documentContent = JSON.stringify(body.documentContent);
    const hashedSecret = createHash('sha256').update(apiKey).digest('hex');

    // check if apiKey matches
    const [keyCheckResult] = await pool.query<RowDataPacket[]>(
      `
      SELECT id
      FROM workspaces w
      WHERE w.id = ?
        AND secret_hash = ?;
      `,
      [workspaceId, hashedSecret]
    );

    if (!keyCheckResult.length) {
      return new Response(JSON.stringify({ success: false }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const documentId = randomUUID();

    // insert it
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO documents (workspace_id, template_id, content, id)
      SELECT ?, ?, ?, ?
      FROM workspaces w
      WHERE w.id = ?
        AND secret_hash = ?;
      `,
      [
        workspaceId,
        templateId,
        documentContent,
        documentId,
        workspaceId,
        hashedSecret,
      ]
    );

    if (result.affectedRows) {
      return new Response(JSON.stringify({ success: true, documentId }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ success: false }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
