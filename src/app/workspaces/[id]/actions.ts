'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';

export async function newTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');

  const name = formData.get('name');
  const template = formData.get('template');
  const workspaceId = formData.get('workspaceId');

  const [result] = await pool.query(
    `
    INSERT INTO templates (name, template, workspace_id)
    SELECT ?, ?, w.id
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE w.id = ? AND u.cognito_user_id = ?
    `,
    [name, template, workspaceId, sub]
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
