'use server';

import { DocumentRow, File, FileWithSignedUrl } from '@/types/types';
import { createClient } from '@/lib/supabase/server';
import { isFileObject } from '@/lib/helpers';
export async function addSignedContentToDocuments(
  documents: DocumentRow[]
): Promise<void> {
  function isRecord(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null;
  }

  async function signValue(value: unknown): Promise<unknown> {
    if (Array.isArray(value)) {
      return Promise.all(value.map(signValue));
    } else if (isRecord(value)) {
      if (isFileObject(value)) {
        const signed = await signUrlsInContentObjectHelper(value);
        return signed ?? value;
      } else {
        const copy: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
          copy[key] = await signValue(val);
        }
        return copy;
      }
    } else {
      return value;
    }
  }

  for (const doc of documents) {
    if (isRecord(doc) && 'content' in doc) {
      doc.signedContent = await signValue(doc.content);
    }
  }
}

// Helper remains the same
export async function signUrlsInContentObjectHelper(
  value: File
): Promise<FileWithSignedUrl | void> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .createSignedUrl(value._fileId, 3600);

    const signed: FileWithSignedUrl = {
      ...value,
      __signedUrl: data?.signedUrl || '',
    };

    return signed;
  } catch (e) {
    console.error('Error signing URL:', e);
  }
}
