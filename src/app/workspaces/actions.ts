'use server';

import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import pool from '@/lib/db';
import { randomUUID } from 'crypto';

export async function createWorkspace(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const name = formData.get('name');

  const workspaceId = randomUUID();

  try {
    await pool.query(
      `
  INSERT INTO workspaces (id, name, user_id)
  SELECT ?, ?, id
  FROM users
  WHERE cognito_user_id = ?
  `,
      [workspaceId, name, sub]
    );

    return { success: true, result: { name: name, workspaceId: workspaceId } };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function deleteWorkspace(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const id = formData.get('id');

  try {
    await pool.query(
      `
      DELETE FROM workspaces
      WHERE id = ?
      AND user_id = (SELECT id FROM users WHERE cognito_user_id = ?)
    `,
      [id, sub]
    );
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}
