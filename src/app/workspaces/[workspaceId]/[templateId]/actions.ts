'use server';

import { FieldType } from '@/types/types';
import { randomUUID } from 'crypto';

import { addSignedContentToDocuments } from './signDocument';
import { getUserOrRedirect } from '@/lib/getUserOrRedirect';
import { createClient } from '@/lib/supabase/server';

export async function createDocument(
  formData: FormData,
  workspaceId: string,
  templateId: string,
  templateKey: string
) {
  const user = await getUserOrRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());

  const documentId = randomUUID();

  // wrap this in try catch for the s3 access thingy
  const contentObject = await createContentObject(
    submittedFields,
    user.id,
    workspaceId,
    templateId,
    templateKey,
    documentId,
    true
  );

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        template_id: templateId,
        workspace_id: workspaceId,
        content: contentObject,
      })
      .select();

    if (error) {
      throw Error(String(error));
    }

    const contentObjectCopy = JSON.parse(JSON.stringify(data));

    // mutate copy to have signed urls;
    await addSignedContentToDocuments(contentObjectCopy);

    return {
      success: true,
      result: {
        templateId: templateId,
        documentId: documentId,
        content: contentObjectCopy[0].content,
        signedContent: contentObjectCopy[0].signedContent,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB error' };
  }
}

export async function deleteDocument(formData: FormData) {
  await getUserOrRedirect('/');
  const documentId = formData.get('id');

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw Error(String(error));
    }

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
  templateKey: string,
  documentId: string
) {
  const user = await getUserOrRedirect('/');
  const submittedFields = Object.fromEntries(formData.entries());

  const contentObject = await createContentObject(
    submittedFields,
    user.id,
    workspaceId,
    templateId,
    templateKey,
    documentId,
    false
  );

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('documents')
      .update({
        template_id: templateId,
        workspace_id: workspaceId,
        content: contentObject,
      })
      .eq('id', documentId)
      .select();

    if (error) {
      throw Error(String(error));
    }

    const contentObjectCopy = JSON.parse(JSON.stringify(data));

    // mutate copy to have signed urls;
    await addSignedContentToDocuments(contentObjectCopy);

    return {
      success: true,
      result: {
        content: contentObjectCopy[0].content,
        signedContent: contentObjectCopy[0].signedContent,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

async function createContentObject(
  entries: { [key: string]: string | File },
  userId: string,
  workspaceId: string,
  templateId: string,
  templateKey: string,
  documentId: string,
  isNew: boolean
): Promise<unknown> {
  const jsonObject: { [key: string]: unknown } = {};

  jsonObject['_templateId'] = templateId; // the template id
  jsonObject['_templateKey'] = templateKey; // the template code name
  jsonObject['_documentId'] = documentId; // document id

  // isNew to check if we're updating or creating
  if (isNew) {
    jsonObject['_createdAt'] = new Date().toISOString();
  }

  jsonObject['_updatedAt'] = new Date().toISOString();

  for (const key in entries) {
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      const value = entries[key];
      const splitKey = key.split('::');
      const fieldType = splitKey[0] as FieldType;

      if (
        fieldType === 'string' ||
        fieldType === 'richText' ||
        fieldType === 'date' ||
        fieldType === 'dateTime' ||
        fieldType === 'time'
      ) {
        const keyName = splitKey[1];
        jsonObject[keyName] = value;
      } else if (fieldType === 'reference') {
        const keyName = splitKey[1];

        if (value) {
          jsonObject[keyName] = {
            _type: 'reference',
            _referenceTo: 'document',
            _referenceId: value,
          };
        }

        // to do maybe
        // must dooooo
        // then we can easily link to the document
        // will be nice
        // tbh we don't need this
        // just query for it... whatever
        // in this case, documents should have their own endpoints
        // _referenceTo: referencedTemplateId
      } else if (fieldType === 'file') {
        const keyName = splitKey[1];
        const option = splitKey[2];

        if (value instanceof File && value.size > 0 && option === 'upload') {
          const { refObject } = await uploadToBucketAndFilesTable(
            value,
            workspaceId,
            templateId,
            documentId,
            userId
          );

          jsonObject[keyName] = refObject;
        } else if (option === 'select' && typeof value === 'string') {
          jsonObject[keyName] = {
            _type: 'reference',
            _referenceTo: 'file',
            _referenceId: value,
          };
        }
      } else if (fieldType === 'number') {
        if (Number(value) && Number(value) !== 0) {
          const keyName = splitKey[1];
          jsonObject[keyName] = Number(value);
        }
      } else if (fieldType === 'boolean') {
        const keyName = splitKey[1];
        if (value === 'true') {
          jsonObject[keyName] = true;
        } else {
          jsonObject[keyName] = false;
        }
      } else if (fieldType === 'array') {
        const keyName = splitKey[2];
        const arrayFieldType = splitKey[1];

        if (
          arrayFieldType === 'string' ||
          arrayFieldType === 'richText' ||
          arrayFieldType === 'date' ||
          arrayFieldType === 'dateTime' ||
          arrayFieldType === 'time'
        ) {
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
          if (typeof value === 'number') {
            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [...jsonObject[keyName], Number(value)]
              : [Number(value)];
          }
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
          // TODO

          const keyName = splitKey[2];
          const option = splitKey[4];

          if (value instanceof File && value.size > 0 && option === 'upload') {
            const { refObject } = await uploadToBucketAndFilesTable(
              value,
              workspaceId,
              templateId,
              documentId,
              userId
            );

            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [...jsonObject[keyName], refObject]
              : [refObject];
          } else if (option === 'select' && typeof value === 'string') {
            jsonObject[keyName] = Array.isArray(jsonObject[keyName])
              ? [
                  ...jsonObject[keyName],
                  {
                    _type: 'reference',
                    _referenceTo: 'file',
                    _referenceId: value,
                  },
                ]
              : [
                  {
                    _type: 'reference',
                    _referenceTo: 'file',
                    _referenceId: value,
                  },
                ];
          }
        }
      }
    }
  }
  return jsonObject as unknown;
}

async function uploadToBucketAndFilesTable(
  value: File,
  workspaceId: string,
  templateId: string,
  documentId: string,
  userId: string | null
) {
  try {
    const fileId = randomUUID();

    const filePath = `${workspaceId}/${templateId}/${documentId}/${fileId}`;
    // lowkey does not make sense to put it underneath userId!
    // just put it under workspaceId!

    const arrayBuffer = await value.arrayBuffer();
    const file = new File([arrayBuffer], value.name, { type: value.type });

    // upload
    const supabase = await createClient();
    const { error: storageError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filePath, file, {
        contentType: value.type,
        upsert: false,
        metadata: {
          originalName: value.name,
          userId: userId,
        },
      });

    if (storageError) throw storageError;

    const result = {
      refObject: {
        _type: 'reference',
        _referenceTo: 'file',
        _referenceId: filePath,
      },
    };

    return result;
  } catch (e) {
    console.error(e);
    throw new Error('Error uploading to bucket');
  }
}

// look here
// make workspaces have api keys
// work on api
// fun
// probably just use amplify and not ec2

// ok seriously
// things to do
// add _templateName (users will be able to filter on _templateName = whatever)
// add _templateId (just for fun)
// keep in mind, if we add these fields, we should probably not allow changes to _templateName in the form, or at least give a warning.
// add _referenceToTemplateName (will be so useful for querying i belive)
// add _referenceToTemplateId (again for fun, but would be insanely helpful)

// link to document from reference
// link to image

// sort by updated at, created at, name

// once i introduce multiple users in one workspace, i must add update rls to allow users in a workspace to update things in a workspace.
// add a way for people to delete files

// updated_at is a problem (not any more)
