'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { FieldType } from '@/types/template';

export async function createDocument(
  formData: FormData,
  templateId: string,
  workspaceId: string
) {
  const sub = await getSubAndRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());
  const contentObject = createContentObject(submittedFields);

  const [result] = await pool.query(
    `
  INSERT INTO documents (template_id, content)
  SELECT t.id, ?
  FROM templates t
  JOIN workspaces w ON t.workspace_id = w.id
  JOIN users u ON w.user_id = u.id
  WHERE t.id = ? AND w.id = ? AND u.cognito_user_id = ?
  `,
    [JSON.stringify(contentObject), templateId, workspaceId, sub]
  );

  return result;
}

export async function deleteDocument(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const documentId = formData.get('id');
  const [result] = await pool.query(
    `
    DELETE FROM documents
    WHERE id = ?
    AND template_id IN (
      SELECT t.id
      FROM templates t
      JOIN workspaces w ON t.workspace_id = w.id
      JOIN users u ON w.user_id = u.id
      WHERE u.cognito_user_id = ?
    );

    `,
    [documentId, sub]
  );

  return result;
}

export async function updateDocument(
  formData: FormData,
  documentId: string,
  templateId: string,
  workspaceId: string
) {
  const sub = await getSubAndRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());
  const contentObject = createContentObject(submittedFields);

  const [result] = await pool.query(
    `
  UPDATE documents d
  JOIN templates t ON d.template_id = t.id
  JOIN workspaces w ON t.workspace_id = w.id
  JOIN users u ON w.user_id = u.id
  SET d.content = ?
  WHERE d.id = ? AND t.id = ? AND w.id = ? AND u.cognito_user_id = ?
  `,
    [JSON.stringify(contentObject), documentId, templateId, workspaceId, sub]
  );

  return result;
}

function createContentObject(entries: { [key: string]: string | File }) {
  const jsonObject: { [key: string]: unknown } = {};

  for (const key in entries) {
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      const value = entries[key];
      const splitKey = key.split('::');
      const fieldType = splitKey[0] as FieldType;
      const keyName = splitKey[1];

      if (
        fieldType === 'string' ||
        fieldType === 'date' ||
        fieldType === 'reference'
      ) {
        jsonObject[keyName] = value;
      }

      if (fieldType === 'file') {
        // create an s3 link
      }

      if (fieldType === 'number') {
        if (typeof value === 'number') jsonObject[keyName] = Number(value);
      }

      if (fieldType === 'boolean') {
        if (value === 'true') {
          jsonObject[keyName] = true;
        } else {
          jsonObject[keyName] = false;
        }
      }
    }
  }

  return jsonObject;
}
