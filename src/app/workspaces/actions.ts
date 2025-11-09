'use server';

import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import pool from '@/lib/db';

export async function createWorkspace(formData: FormData) {
  const sub = await getSubAndRedirect('/');

  const name = formData.get('name');

  await pool.query(
    `INSERT INTO workspaces (name, user_id)
    SELECT ?, id
    FROM users
    WHERE cognito_user_id = ?`,
    [name, sub]
  );
}

export async function deleteWorkspace(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const id = formData.get('id');
  const [result] = await pool.query(
    `
    DELETE FROM workspaces
    WHERE id = ?
      AND user_id = (SELECT id FROM users WHERE cognito_user_id = ?)
    `,
    [id, sub]
  );

  return result;
}
