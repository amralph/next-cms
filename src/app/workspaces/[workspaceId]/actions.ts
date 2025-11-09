'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { JSONValue } from '@/types/extendsRowDataPacket';

export async function createTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');

  const name = formData.get('name');
  const jsonTemplate = formData.get('template');
  const workspaceId = formData.get('workspaceId');

  if (!jsonTemplate || !isValidTemplate(jsonTemplate.toString())) {
    return;
  }

  const [result] = await pool.query(
    `
    INSERT INTO templates (name, template, workspace_id)
    SELECT ?, ?, w.id
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE w.id = ? AND u.cognito_user_id = ?
    `,
    [name, jsonTemplate?.toString(), workspaceId, sub]
  );

  return result;
}

export async function updateTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const jsonTemplate = formData.get('template');
  const name = formData.get('name');
  const templateId = formData.get('id');

  const [result] = await pool.query(
    `
    UPDATE templates t
    JOIN workspaces w on t.workspace_id = w.id
    JOIN users u on w.user_id = u.id
    SET t.name = ?, t.template = ?
    WHERE t.id = ? AND u.cognito_user_id = ?;
    `,
    [name, jsonTemplate, templateId, sub]
  );
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

function isValidTemplate(templateStr: string): boolean {
  try {
    const parsed = JSON.parse(templateStr);

    // Must be an array
    if (!Array.isArray(parsed)) return false;
    // No object in the array should have a 'type' key
    if (parsed.some((item) => hasTypeKey(item))) return false;

    return true;
  } catch {
    return false;
  }
}

function hasTypeKey(obj: JSONValue): boolean {
  if (obj === null || typeof obj !== 'object') return false;

  if (Array.isArray(obj)) {
    // Check each item in the array
    return obj.some((item) => hasTypeKey(item));
  }

  // obj is a plain object
  for (const key in obj) {
    if (key === 'type') return true;

    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      if (hasTypeKey(value)) return true;
    }
  }

  return false;
}
