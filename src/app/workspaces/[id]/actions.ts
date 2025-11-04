'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';

export async function newTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');

  const name = formData.get('name');
  const jsonTemplate = formData.get('template');
  const workspaceId = formData.get('workspaceId');

  if (!isValidTemplate(jsonTemplate?.toString()!)) {
    return;
  }

  const indexedJsonTemplate = indexTemplate(jsonTemplate?.toString()!);

  const [result] = await pool.query(
    `
    INSERT INTO templates (name, template, workspace_id)
    SELECT ?, ?, w.id
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE w.id = ? AND u.cognito_user_id = ?
    `,
    [name, indexedJsonTemplate, workspaceId, sub]
  );

  return result;
}

export async function deleteTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const templateId = formData.get('id');
  const [result] = await pool.query(
    `
    DELETE FROM templates
    WHERE id = ?
      AND workspace_id IN (
        SELECT w.id
        FROM workspaces w
        JOIN users u ON w.user_id = u.id
        WHERE u.cognito_user_id = ?
      )
    `,
    [templateId, sub]
  );

  return result;
}

function indexTemplate(schemaStr: string): string {
  const obj = JSON.parse(schemaStr) as Record<string, string>;

  const result = Object.entries(obj).map(([key, type]) => ({ [key]: type }));

  return JSON.stringify(result, null, 2);
}

function isValidTemplate(input: string): boolean {
  const allowedValues = ['string', 'number', 'boolean', 'image'];

  try {
    const parsed = JSON.parse(input);

    // Check that parsed is an object and not null or array
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return false;
    }

    // Check that all values are allowed and no nested objects
    for (const key in parsed) {
      const value = parsed[key];
      if (typeof value !== 'string' || !allowedValues.includes(value)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
