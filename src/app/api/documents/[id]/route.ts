import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// update document
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const documentContent = JSON.stringify(body.documentContent);
    const hashedSecret = createHash('sha256').update(apiKey).digest('hex');

    // get documentId
    const documentId = (await params).id;

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

    // insert it
    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE documents d
      JOIN workspaces w ON w.id = d.workspace_id
      SET d.content = CAST(? AS JSON),
        d.updated_at = CURRENT_TIMESTAMP
      WHERE d.id = ?
        AND d.workspace_id = ?
        AND w.secret_hash = ?
  `,
      [documentContent, documentId, workspaceId, hashedSecret]
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const documentContent = JSON.stringify(body.documentContent);
    const hashedSecret = createHash('sha256').update(apiKey).digest('hex');

    // get documentId
    const documentId = (await params).id;

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

    // patch it
    const [result] = await pool.query<ResultSetHeader>(
      `
    UPDATE documents d
    JOIN workspaces w ON w.id = d.workspace_id
    SET d.content = JSON_MERGE_PATCH(d.content, CAST(? AS JSON)),
        d.updated_at = CURRENT_TIMESTAMP
    WHERE d.id = ?
      AND d.workspace_id = ?
      AND w.secret_hash = ?
  `,
      [documentContent, documentId, workspaceId, hashedSecret]
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const hashedSecret = createHash('sha256').update(apiKey).digest('hex');

    // get documentId
    const documentId = (await params).id;

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

    // delete it
    const [result] = await pool.query<ResultSetHeader>(
      `
        DELETE d
        FROM documents d
        JOIN workspaces w ON w.id = d.workspace_id
        WHERE d.id = ?
            AND d.workspace_id = ?
            AND w.secret_hash = ?
        `,
      [documentId, workspaceId, hashedSecret]
    );

    if (result.affectedRows) {
      return new Response(JSON.stringify({ success: true }), {
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
