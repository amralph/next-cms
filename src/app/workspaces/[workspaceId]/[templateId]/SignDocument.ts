'use server';

import { Content } from '@/types/extendsRowDataPacket';
import { Reference } from '@/types/extendsRowDataPacket';
import { createClient } from '@/lib/supabase/server';
export async function signUrlsInContentObject(contentObject: Content) {
  // first we iterate over each key in the original
  for (const [, value] of Object.entries(contentObject)) {
    // keep in mind this object isn't supposed to be recursive

    // we only care about arrays and objects
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        await Promise.all(
          value.map(async (v) => {
            if (typeof v === 'object' && v !== null) {
              if (v['_referenceTo'] === 'file') {
                await signUrlsInContentObjectHelper(v);
              }
            }
          })
        );
      } else {
        if (value['_referenceTo'] === 'file') {
          // mutate and sign it!
          await signUrlsInContentObjectHelper(value);
        }
      }
    }
  }
}

async function signUrlsInContentObjectHelper(value: Reference) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!) // your bucket name
      .createSignedUrl(value._referenceId, 3600);

    value._referenceId = data?.signedUrl || '';
  } catch (e) {
    console.error('Error signing URL:', e);
  }
}
