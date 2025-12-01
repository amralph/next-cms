import pool from '@/lib/db';
import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { createHash } from 'crypto';

type ComparisonOps = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte';
type SpecialOps = 'contains' | 'exists';
type AllowedOps = ComparisonOps | SpecialOps;

type FilterValue =
  | string
  | number
  | boolean
  | { [K in AllowedOps]?: string | number | boolean | object };

interface DocumentsRequestBody {
  workspaceId: string;
  filter?: Record<string, FilterValue>;
  project?: string[];
  limit?: number;
  sort?: Record<string, 'asc' | 'desc'>;
}

interface WorkspaceRow extends RowDataPacket {
  id: string;
  private: 0 | 1;
  secret_hash: string;
  public_key: string;
}

const ALLOWED_OPS: AllowedOps[] = [
  'eq',
  'ne',
  'gt',
  'lt',
  'gte',
  'lte',
  'contains',
  'exists',
];

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const apiKey = authHeader.slice('Bearer '.length).trim();

    const body: unknown = await req.json();

    if (!isDocumentsRequestBody(body)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const {
      workspaceId,
      filter = {},
      project = [],
      limit = 50,
      sort = {},
    } = body;

    const [workspaceRows] = await pool.query<WorkspaceRow[]>(
      'SELECT id, private, secret_hash, public_key FROM workspaces WHERE id = ?',
      [workspaceId]
    );

    if (workspaceRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Workspace not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const workspace = workspaceRows[0];

    // Access control
    if (workspace.private) {
      const hashedSecret = createHash('sha256').update(apiKey).digest('hex');
      if (hashedSecret !== workspace.secret_hash) {
        return new Response(JSON.stringify({ error: 'Invalid secret key' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      if (apiKey !== workspace.public_key) {
        return new Response(JSON.stringify({ error: 'Invalid public key' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const { whereSql, whereParams } = buildWhere(filter);
    const orderSql = buildSort(sort);
    const projectionSql = buildProjection(project);

    const sql = `
      SELECT ${projectionSql}
      FROM documents
      WHERE workspace_id = ?
      ${whereSql}
      ${orderSql}
      LIMIT ?
    `;
    const params: Array<string | number> = [workspaceId, ...whereParams, limit];
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    return new Response(JSON.stringify({ documents: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// -------------------
// Helpers
// -------------------

function buildProjection(project: string[]): string {
  if (project.length === 0) return '*';
  return project
    .map((key) => {
      if (key.startsWith('content.')) {
        const jsonPath = key.replace('content.', '$.');
        const alias = key.replace(/\./g, '_');
        return `JSON_EXTRACT(content, '${jsonPath}') AS ${alias}`;
      }
      return key;
    })
    .join(', ');
}

function buildWhere(filter: Record<string, FilterValue>): {
  whereSql: string;
  whereParams: Array<string | number>;
} {
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  for (const key of Object.keys(filter)) {
    const value = filter[key];
    const jsonPath = key.replace('content.', '$.');

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      clauses.push(`AND JSON_EXTRACT(content, ?) = ?`);
      params.push(jsonPath, String(value));
      continue;
    }

    const op = Object.keys(value)[0] as AllowedOps;
    if (!ALLOWED_OPS.includes(op))
      throw new Error(`Operator not allowed: ${op}`);
    const operand = value[op];

    switch (op) {
      case 'eq':
      case 'ne':
      case 'gt':
      case 'lt':
      case 'gte':
      case 'lte':
        clauses.push(
          `AND CAST(JSON_EXTRACT(content, ?) AS SIGNED) ${sqlOp(op)} ?`
        );
        params.push(jsonPath, Number(operand));
        break;
      case 'contains':
        clauses.push(`AND JSON_CONTAINS(JSON_EXTRACT(content, ?), ?)`);
        params.push(jsonPath, JSON.stringify(operand));
        break;
      case 'exists':
        clauses.push(
          `AND JSON_EXTRACT(content, ?) IS ${operand ? 'NOT NULL' : 'NULL'}`
        );
        params.push(jsonPath);
        break;
    }
  }

  return { whereSql: clauses.join(' '), whereParams: params };
}

function sqlOp(op: ComparisonOps): string {
  return { gt: '>', lt: '<', gte: '>=', lte: '<=', eq: '=', ne: '!=' }[op];
}

function buildSort(sort: Record<string, 'asc' | 'desc'>): string {
  const order = Object.entries(sort).map(([key, dir]) => {
    const jsonPath = key.replace('content.', '$.');
    const direction = dir === 'desc' ? 'DESC' : 'ASC';
    return `CAST(JSON_EXTRACT(content, '${jsonPath}') AS SIGNED) ${direction}`;
  });
  return order.length ? 'ORDER BY ' + order.join(', ') : '';
}

// -------------------
// Type guards
// -------------------

function isDocumentsRequestBody(obj: unknown): obj is DocumentsRequestBody {
  if (typeof obj !== 'object' || obj === null) return false;
  const body = obj as Record<string, unknown>;
  if (typeof body.workspaceId !== 'string') return false;
  if (body.filter !== undefined && typeof body.filter !== 'object')
    return false;
  if (body.project !== undefined && !Array.isArray(body.project)) return false;
  if (body.limit !== undefined && typeof body.limit !== 'number') return false;
  if (body.sort !== undefined && typeof body.sort !== 'object') return false;
  return true;
}
