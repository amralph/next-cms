'use server';

import pool from '@/lib/db';
import { getSubAndRedirect } from '@/lib/getSubAndRedirect';

const specialCmsTypes = ['file', 'reference'];

export async function createDocument(
  formData: FormData,
  templateId: string,
  workspaceId: string
) {
  const sub = await getSubAndRedirect('/');

  // get formData and turn it into a json object that we like
  // if one of the fields is a file, upload that file to s3,
  //    in the form of /[user]/[workspace]/[template]/[document]/[fileId]
  //    then include that link

  // json object should look like

  // from the name, get the type
  // then format the data to look like the following

  const entriesArray = Array.from(formData.entries());

  const [result] = await pool.query(
    `
  INSERT INTO documents (template_id, content)
  SELECT t.id, ?
  FROM templates t
  JOIN workspaces w ON t.workspace_id = w.id
  JOIN users u ON w.user_id = u.id
  WHERE t.id = ? AND w.id = ? AND u.cognito_user_id = ?
  `,
    [
      JSON.stringify(createContentObject(entriesArray)),
      templateId,
      workspaceId,
      sub,
    ]
  );

  return result;

  /*
  [
  {'title' : 'first article', type: 'string'},
  {'content' : 'hello everyone!', type: 'string'},
  {'public' : true, type: 'boolean'},
  {'readTime' : 5, type: 'number'},
  {'guideReference' : { type: 'reference', templateId: 123 documentId: 123 }} // worry about this later tbh
  {'thumbnail' : 's3 link', type: 'file'}, // worry about this later
  }
  ]
  */

  // const jsonObject = Object.fromEntries(formData.entries());
  // const jsonString = JSON.stringify(jsonObject);

  // console.log(jsonObject);
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

  const entriesArray = Array.from(formData.entries());

  const [result] = await pool.query(
    `
  UPDATE documents d
  JOIN templates t ON d.template_id = t.id
  JOIN workspaces w ON t.workspace_id = w.id
  JOIN users u ON w.user_id = u.id
  SET d.content = ?
  WHERE d.id = ? AND t.id = ? AND w.id = ? AND u.cognito_user_id = ?
  `,
    [
      JSON.stringify(createContentObject(entriesArray)),
      documentId,
      templateId,
      workspaceId,
      sub,
    ]
  );

  return result;
}

function createContentObject(entriesArray: [string, FormDataEntryValue][]) {
  const contentJsonArray: { [x: string]: FormDataEntryValue; type: string }[] =
    [];

  entriesArray.forEach((entry) => {
    const splitKey = entry[0].split('::');

    const cmsType = splitKey[0];
    const keyName = splitKey[1];
    const value = entry[1];

    if (!specialCmsTypes.includes(cmsType))
      contentJsonArray.push({ [keyName]: value, type: cmsType });
  });

  return contentJsonArray;
}
