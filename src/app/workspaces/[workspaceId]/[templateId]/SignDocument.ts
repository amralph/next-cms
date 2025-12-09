'use server';

import { Reference, SignedReference } from '@/types/extendsRowDataPacket';
import { createClient } from '@/lib/supabase/server';
import { isReferenceObject } from '@/lib/helpers';
export async function addSignedContentToDocuments(
  documents: unknown[]
): Promise<void> {
  function isRecord(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null;
  }

  async function signValue(value: unknown): Promise<unknown> {
    if (Array.isArray(value)) {
      return Promise.all(value.map(signValue));
    } else if (isRecord(value)) {
      if (isReferenceObject(value) && value['_referenceTo'] === 'file') {
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
  value: Reference
): Promise<SignedReference | void> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .createSignedUrl(value._referenceId, 3600);

    const signed: SignedReference = {
      ...value,
      __signedUrl: data?.signedUrl || '',
    };

    return signed;
  } catch (e) {
    console.error('Error signing URL:', e);
  }
}
