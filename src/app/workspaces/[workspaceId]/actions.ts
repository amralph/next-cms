'use server';

import { JSONValue } from '@/types/extendsRowDataPacket';
import { createClient } from '@/lib/supabase/server';

export async function createTemplate(formData: FormData) {
  const jsonTemplate = formData.get('template');
  const workspaceId = formData.get('workspaceId');

  if (!isValidTemplate(JSON.stringify(jsonTemplate))) {
    return { success: false, error: 'Invalid template' };
  }

  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('templates')
      .insert({
        template: JSON.parse(jsonTemplate as string),
        workspace_id: workspaceId,
      })
      .select()
      .single();

    return {
      success: true,
      result: { templateId: data.id, template: jsonTemplate?.toString() },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function updateTemplate(formData: FormData, templateId: string) {
  const jsonTemplate = formData.get('template');

  if (!jsonTemplate || !isValidTemplate(JSON.stringify(jsonTemplate))) {
    return { success: false, error: 'Invalid template' };
  }

  try {
    const supabase = await createClient();

    await supabase
      .from('templates')
      .update({ template: JSON.parse(jsonTemplate as string) })
      .eq('id', templateId)
      .select()
      .single();

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'DB Error' };
  }
}

export async function deleteTemplate(formData: FormData) {
  const templateId = formData.get('id');

  try {
    const supabase = await createClient();
    await supabase.from('templates').delete().eq('id', templateId);

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
    'richText',
    'file',
    'boolean',
    'number',
    'date',
    'reference',
    'array',
  ];

  const validArrayTypes = [
    'string',
    'richText',
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
    console.error(e);
    return false;
  }

  return true;
}

function isValidKey(key: JSONValue): boolean {
  if (typeof key !== 'string') {
    return false;
  }
  const pattern = /^[a-z][a-zA-Z0-9_]{0,63}$/;

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
