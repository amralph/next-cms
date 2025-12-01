'use server';

import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import pool from '@/lib/db';
import { randomUUID, randomBytes, createHash } from 'crypto';

export async function createWorkspace(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const name = formData.get('name');

  const workspaceId = randomUUID();
  const secret = randomBytes(32).toString('hex');
  const hashedSecret = createHash('sha256').update(secret).digest('hex');
  const publicKey = randomUUID();

  if (!name) {
    return { success: false, error: 'Missing name' };
  }

  try {
    await pool.query(
      `
  INSERT INTO workspaces (id, name, user_id, secret_hash, public_key)
  SELECT ?, ?, id, ?, ?
  FROM users
  WHERE cognito_user_id = ?
  `,
      [workspaceId, name, hashedSecret, publicKey, sub]
    );

    return {
      success: true,
      result: { name: name, workspaceId: workspaceId },
      secret,
    };
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

export async function updateWorkspace(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const id = formData.get('id');
  const name = formData.get('name');

  try {
    await pool.query(
      `
        UPDATE workspaces
        SET name = ?
        WHERE id = ?
        AND user_id = (SELECT id FROM users WHERE cognito_user_id = ?)
      `,
      [name, id, sub]
    );
    return { success: true, result: { id, name } };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updateSecret(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const id = formData.get('id');
  const secret = randomBytes(32).toString('hex');
  const hashedSecret = createHash('sha256').update(secret).digest('hex');

  try {
    await pool.query(
      `
        UPDATE workspaces
        SET secret_hash = ?
        WHERE id = ?
        AND user_id = (SELECT id FROM users WHERE cognito_user_id = ?)
      `,
      [hashedSecret, id, sub]
    );
    return { success: true, secret };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updatePrivate(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const id = formData.get('id');
  const isPrivate = formData.get('private') === 'on' ? true : false;

  try {
    await pool.query(
      `
        UPDATE workspaces
        SET private = ?
        WHERE id = ?
        AND user_id = (SELECT id FROM users WHERE cognito_user_id = ?)
      `,
      [isPrivate, id, sub]
    );
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}
