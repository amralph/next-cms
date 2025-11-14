'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { JSONValue } from '@/types/extendsRowDataPacket';
import { randomUUID } from 'crypto';

export async function createTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');

  const jsonTemplate = formData.get('template');
  const workspaceId = formData.get('workspaceId');

  if (!isValidTemplate(jsonTemplate as string)) {
    return { success: false, error: 'Invalid template' };
  }

  try {
    const templateId = randomUUID();

    await pool.query(
      `
    INSERT INTO templates (id, template, workspace_id)
    SELECT ?, ?, w.id
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE w.id = ? AND u.cognito_user_id = ?
    `,
      [templateId, jsonTemplate?.toString(), workspaceId, sub]
    );

    return {
      success: true,
      result: { templateId: templateId, template: jsonTemplate?.toString() },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updateTemplate(formData: FormData, templateId: string) {
  const sub = await getSubAndRedirect('/');
  const jsonTemplate = formData.get('template');

  if (!jsonTemplate || !isValidTemplate(jsonTemplate.toString())) {
    return { success: false, error: 'Invalid template' };
  }

  try {
    await pool.query(
      `
    UPDATE templates t
    JOIN workspaces w on t.workspace_id = w.id
    JOIN users u on w.user_id = u.id
    SET t.template = ?
    WHERE t.id = ? AND u.cognito_user_id = ?;
    `,
      [jsonTemplate, templateId, sub]
    );

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function deleteTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');
  const templateId = formData.get('id');

  try {
    await pool.query(
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

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

function isValidTemplate(templateString: string): boolean {
  // valid types
  const validTypes = [
    'string',
    'file',
    'boolean',
    'number',
    'date',
    'reference',
    'array',
  ];

  const validArrayTypes = [
    'string',
    'file',
    'boolean',
    'number',
    'date',
    'reference',
  ];

  try {
    const template = JSON.parse(templateString);

    // check it's an object
    if (template && typeof template === 'object' && !Array.isArray(template)) {
      // must have a key

      if (!(template.key && isValidKey(template.key))) {
        return false;
      }

      // must have a name
      if (!(template.name && isValidName(template.name))) {
        return false;
      }

      if (template.fields && Array.isArray(template.fields)) {
        // check each field
        for (const field of template.fields) {
          // Must be an object
          if (!field || typeof field !== 'object' || Array.isArray(field)) {
            return false;
          }

          // Must have key and is valid
          if (!('key' in field) || !isValidKey(field.key)) {
            return false;
          }

          // Must have name and it must be a string
          if (
            !('name' in field) ||
            typeof field.name !== 'string' ||
            !isValidName(field.name)
          ) {
            return false;
          }

          // Must have type and must be a string and must be a valid type
          if (
            !('type' in field) ||
            typeof field.type !== 'string' ||
            !validTypes.includes(field.type)
          ) {
            return false;
          }

          // if array, check that the arrayOf is a valid type that isn't array
          if (field.type === 'array') {
            // must have an arrayOf field and arrayOf must be a string and an array type and a valid array type
            if (
              !('arrayOf' in field) ||
              typeof field.arrayOf !== 'string' ||
              !validArrayTypes.includes(field.arrayOf)
            ) {
              return false;
            }
          }
        }
      }
    }
  } catch (e) {
    return false;
  }

  return true;
}

function isValidKey(key: JSONValue): boolean {
  if (typeof key !== 'string') {
    return false;
  }
  const pattern = /^[a-z][a-z0-9_]{0,63}$/;
  return pattern.test(key);
}

function isValidName(name: JSONValue): boolean {
  if (typeof name !== 'string') return false;

  // Trim whitespace (but allow spaces inside)
  const trimmed = name.trim();
  if (trimmed.length === 0) return false;

  // Ensure no control characters (0x00 - 0x1F, 0x7F)
  const controlChars = /[\u0000-\u001F\u007F]/;
  if (controlChars.test(trimmed)) return false;

  // Length safety (optional)
  if (trimmed.length > 255) return false;

  return true;
}
