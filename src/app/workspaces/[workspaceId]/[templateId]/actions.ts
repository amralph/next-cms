'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { FieldType } from '@/types/template';
import { randomUUID } from 'crypto';

export async function createDocument(formData: FormData, templateId: string) {
  const sub = await getSubAndRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());
  const contentObject = createContentObject(submittedFields);
  const stringifiedContentObject = JSON.stringify(contentObject);

  const documentId = randomUUID();

  try {
    await pool.query(
      `
    INSERT INTO documents (id, template_id, content)
    SELECT ?, t.id, ?
    FROM templates t
    JOIN workspaces w ON t.workspace_id = w.id
    JOIN users u ON w.user_id = u.id
    WHERE t.id = ? AND u.cognito_user_id = ?
    `,
      [documentId, stringifiedContentObject, templateId, sub]
    );

    return {
      success: true,
      result: {
        templateId: templateId,
        documentId: documentId,
        content: stringifiedContentObject,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB error' };
  }
}

export async function deleteDocument(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const documentId = formData.get('id');

  try {
    await pool.query(
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

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updateDocument(formData: FormData, documentId: string) {
  const sub = await getSubAndRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());
  const contentObject = createContentObject(submittedFields);

  try {
    await pool.query(
      `
  UPDATE documents d
  JOIN templates t ON d.template_id = t.id
  JOIN workspaces w ON t.workspace_id = w.id
  JOIN users u ON w.user_id = u.id
  SET d.content = ?
  WHERE d.id = ? AND u.cognito_user_id = ?
  `,
      [JSON.stringify(contentObject), documentId, sub]
    );

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

function createContentObject(entries: { [key: string]: string | File }) {
  const jsonObject: { [key: string]: unknown } = {};

  for (const key in entries) {
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      const value = entries[key];
      const splitKey = key.split('::');
      const fieldType = splitKey[0] as FieldType;

      if (
        fieldType === 'string' ||
        fieldType === 'date' ||
        fieldType === 'reference'
      ) {
        const keyName = splitKey[1];
        jsonObject[keyName] = value;
      }

      if (fieldType === 'file') {
        // create an s3 link
      }

      if (fieldType === 'number') {
        const keyName = splitKey[1];
        if (typeof value === 'number') jsonObject[keyName] = Number(value);
      }

      if (fieldType === 'boolean') {
        const keyName = splitKey[1];
        if (value === 'true') {
          jsonObject[keyName] = true;
        } else {
          jsonObject[keyName] = false;
        }
      }

      if (fieldType === 'array') {
        const keyName = splitKey[3];
        const arrayFieldType = splitKey[1];

        if (
          arrayFieldType === 'string' ||
          arrayFieldType === 'date' ||
          arrayFieldType === 'reference'
        ) {
          jsonObject[keyName] = Array.isArray(jsonObject[keyName])
            ? [...jsonObject[keyName], value]
            : [value];
        }

        if (arrayFieldType === 'number') {
          jsonObject[keyName] = Array.isArray(jsonObject[keyName])
            ? [...jsonObject[keyName], Number(value)]
            : [Number(value)];
        }

        if (arrayFieldType === 'boolean') {
          if (value === 'true') {
            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [...jsonObject[keyName], true]
              : [true];
          } else {
            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [...jsonObject[keyName], false]
              : [false];
          }
        }

        if (arrayFieldType === 'file') {
          // not sure
        }
      }
    }
  }

  return jsonObject;
}
