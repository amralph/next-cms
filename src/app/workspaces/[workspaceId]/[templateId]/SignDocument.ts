'use server';

import {
  DocumentRow,
  File,
  FileWithSignedUrl,
  SignedDocumentRow,
} from '@/types/types';
import { isFileObject } from '@/lib/helpers';
import { SupabaseClient } from '@supabase/supabase-js';
export async function addSignedContentToDocuments(
  documents: DocumentRow[],
  supabase: SupabaseClient
): Promise<void> {
  for (const doc of documents) {
    if (isRecord(doc) && 'content' in doc) {
      (doc as SignedDocumentRow).signedContent = await signValue(
        doc.content,
        supabase
      );
    }
  }
}

// Helper remains the same
export async function signUrlsInContentObjectHelper(
  value: File,
  supabase: SupabaseClient
): Promise<FileWithSignedUrl | void> {
  try {
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

export async function signValue(
  value: unknown,
  supabase: SupabaseClient
): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(value.map((v) => signValue(v, supabase)));
  } else if (isRecord(value)) {
    if (isFileObject(value)) {
      const signed = await signUrlsInContentObjectHelper(value, supabase);
      return signed ?? value;
    } else {
      const copy: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        copy[key] = await signValue(val, supabase);
      }
      return copy;
    }
  } else {
    return value;
  }
}

function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}
