'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';
import { FieldType } from '@/types/template';
import { randomUUID } from 'crypto';
import { s3Client } from '@/lib/s3Client';
import { RowDataPacket } from 'mysql2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import { signUrlsInContentObject } from './SignDocument';
import { Content } from '@/types/extendsRowDataPacket';

export async function createDocument(
  formData: FormData,
  workspaceId: string,
  templateId: string
) {
  const sub = await getSubAndRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());

  const documentId = randomUUID();

  // wrap this in try catch for the s3 access thingy
  const contentObject = await createContentObject(
    submittedFields,
    sub,
    workspaceId,
    templateId,
    documentId
  );

  const stringifiedContentObject = JSON.stringify(contentObject);

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

    const contentObjectCopy = JSON.parse(JSON.stringify(contentObject));

    // mutate copy to have signed urls;
    await signUrlsInContentObject(contentObjectCopy);

    return {
      success: true,
      result: {
        templateId: templateId,
        documentId: documentId,
        content: contentObjectCopy,
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

export async function updateDocument(
  formData: FormData,
  workspaceId: string,
  templateId: string,
  documentId: string
) {
  const sub = await getSubAndRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());
  const contentObject = await createContentObject(
    submittedFields,
    sub,
    workspaceId,
    templateId,
    documentId
  );

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

    const contentObjectCopy = JSON.parse(JSON.stringify(contentObject));

    // mutate copy to have signed urls;
    await signUrlsInContentObject(contentObjectCopy);

    return { success: true, result: contentObjectCopy };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

async function createContentObject(
  entries: { [key: string]: string | File },
  sub: string,
  workspaceId: string,
  templateId: string,
  documentId: string
): Promise<Content> {
  const jsonObject: { [key: string]: unknown } = {};

  let userId = null;

  for (const key in entries) {
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      const value = entries[key];
      const splitKey = key.split('::');
      const fieldType = splitKey[0] as FieldType;

      if (fieldType === 'string' || fieldType === 'date') {
        if (value) {
          const keyName = splitKey[1];
          jsonObject[keyName] = value;
        }
      }

      if (fieldType === 'reference') {
        if (value) {
          const keyName = splitKey[1];
          jsonObject[keyName] = {
            _type: 'reference',
            _referenceTo: 'document',
            _referenceId: value,
          };
        }

        // to do maybe
        // _referenceTo: referencedTemplateId
      }

      if (fieldType === 'file' && value instanceof File && value.size > 0) {
        const keyName = splitKey[1];

        const { refObject, updatedUserId } = await uploadToS3(
          value,
          sub,
          workspaceId,
          templateId,
          documentId,
          userId
        );

        if (!userId) {
          userId = updatedUserId;
        }

        jsonObject[keyName] = refObject;
      }

      if (fieldType === 'number') {
        if (Number(value) && Number(value) !== 0) {
          const keyName = splitKey[1];
          jsonObject[keyName] = Number(value);
        }
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
        if (value) {
          const keyName = splitKey[3];
          const arrayFieldType = splitKey[1];

          if (arrayFieldType === 'string' || arrayFieldType === 'date') {
            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [...jsonObject[keyName], value]
              : [value];
          }

          if (arrayFieldType === 'reference') {
            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [
                  ...jsonObject[keyName],
                  {
                    _type: 'reference',
                    _referenceTo: 'document',
                    _referenceId: value,
                  },
                ]
              : [
                  {
                    _type: 'reference',
                    _referenceTo: 'document',
                    _referenceId: value,
                  },
                ];
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
            const { refObject, updatedUserId } = await uploadToS3(
              value,
              sub,
              workspaceId,
              templateId,
              documentId,
              userId
            );

            if (!userId) {
              userId = updatedUserId;
            }

            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [...jsonObject[keyName], refObject]
              : [refObject];
          }
        }
      }
    }
  }
  return jsonObject as Content;
}

async function uploadToS3(
  value: string | File,
  sub: string,
  workspaceId: string,
  templateId: string,
  documentId: string,
  userId: string | null
) {
  try {
    if (!(value instanceof File)) {
      throw new Error('value is not a file');
    }

    if (!userId) {
      const [result] = await pool.query<RowDataPacket[] & { id: string }[]>(
        `
          SELECT u.id
          FROM users u
          WHERE u.cognito_user_id = ?
          LIMIT 1
        `,
        [sub]
      );

      userId = result[0].id;
    }
    // if no userId, throw error
    if (!userId) {
      throw new Error('userId not found');
    }

    //create an s3 link and upload
    const key = `data/users/${userId}/workspaces/${workspaceId}/templates/${templateId}/documents/${documentId}/${Date.now()}_${
      value.name
    }`;

    const arrayBuffer = await value.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: value.type,
      Metadata: {
        originalName: value.name,
      },
    });

    await s3Client.send(command);

    const result = {
      refObject: {
        _type: 'reference',
        _referenceTo: 'file',
        _referenceId: key,
      },
      updatedUserId: userId,
    };

    return result;
  } catch (e) {
    console.error(e);
    throw new Error('Error uploading to s3');
  }
}

// look here
// add a updated_at column (important!)
// make workspaces have api keys
// work on api
// fun
// probably just use amplify and not ec2

// work out how to get file name on frontend
