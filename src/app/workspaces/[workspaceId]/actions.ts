'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { JSONValue } from '@/types/extendsRowDataPacket';

export async function createTemplate(formData: FormData) {
  const sub = await getSubAndRedirect('/');

  const jsonTemplate = formData.get('template');
  const workspaceId = formData.get('workspaceId');

  if (!jsonTemplate || !isValidTemplate(jsonTemplate.toString())) {
    return;
  }

  const [result] = await pool.query(
    `
    INSERT INTO templates (template, workspace_id)
    SELECT ?, w.id
    FROM workspaces w
    JOIN users u ON w.user_id = u.id
    WHERE w.id = ? AND u.cognito_user_id = ?
    `,
    [jsonTemplate?.toString(), workspaceId, sub]
  );

  return result;
}

export async function updateTemplate(formData: FormData, templateId: string) {
  const sub = await getSubAndRedirect('/');
  const jsonTemplate = formData.get('template');

  if (!jsonTemplate || !isValidTemplate(jsonTemplate.toString())) {
    return;
  }

  const [result] = await pool.query(
    `
    UPDATE templates t
    JOIN workspaces w on t.workspace_id = w.id
    JOIN users u on w.user_id = u.id
    SET t.template = ?
    WHERE t.id = ? AND u.cognito_user_id = ?;
    `,
    [jsonTemplate, templateId, sub]
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

function isValidTemplate(template: JSONValue): boolean {
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

  // check it's an object
  if (template && typeof template === 'object' && !Array.isArray(template)) {
    if (!(template.key && isValidKey(template.key))) {
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
        if (!('name' in field) || typeof field.name !== 'string') {
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

  return true;

  // const exampleValidTemplate = {
  //   key: 'book',
  //   name: 'Book',
  //   fields: [
  //     {
  //       key: 'title', // the key in the jsonContent object
  //       name: 'Title', // what the user sees in the form
  //       type: 'string', // the type
  //       description: 'Title of the book', // a small description that users will see
  //     },
  //     {
  //       key: 'thumbnail',
  //       name: 'Thumbnail',
  //       type: 'file',
  //       description: 'Image of book',
  //     },
  //     {
  //       key: 'public',
  //       name: 'Public',
  //       type: 'boolean',
  //       description: 'Is this book public?',
  //     },
  //     {
  //       key: 'readTime',
  //       name: 'Read time',
  //       type: 'number',
  //       description: 'In minutes',
  //     },
  //     {
  //       key: 'recommendedBook',
  //       name: 'Recommended book',
  //       type: 'reference', // too lazy to create referenceTo lol, but here, just expect to see an id
  //     },
  //     {
  //       key: 'authors',
  //       name: 'Authors',
  //       type: 'array',
  //       arrayOf: 'reference',
  //     },
  //   ],
  // };
}

function isValidKey(key: JSONValue): boolean {
  if (typeof key !== 'string') {
    return false;
  }
  const pattern = /^[a-z][a-z0-9_-]{0,63}$/;
  return pattern.test(key);
}
