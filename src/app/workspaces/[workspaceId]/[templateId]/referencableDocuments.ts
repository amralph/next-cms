import { DocumentRow } from '@/types/types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function fetchReferencableDocuments(
  templateIds: Set<string>,
  page: number,
  pageSize: number,
  supabase: SupabaseClient
) {
  const results: Record<string, DocumentRow[]> = {};

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  for (const templateId of templateIds) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    results[templateId] = data ?? [];
  }

  return results;
}

export function mergeDocumentRecords(
  a: Record<string, DocumentRow[]>,
  b: Record<string, DocumentRow[]>
): Record<string, DocumentRow[]> {
  const result: Record<string, DocumentRow[]> = { ...a };

  for (const key of Object.keys(b)) {
    if (!result[key]) {
      // if key doesn't exist in `a`, just take it
      result[key] = [...b[key]];
    } else {
      // merge arrays, skipping duplicates by id
      const existingIds = new Set(result[key].map((doc) => doc.id));
      const newDocs = b[key].filter((doc) => !existingIds.has(doc.id));
      result[key] = [...result[key], ...newDocs];
    }
  }

  return result;
}

export function allKeysEmpty(obj: Record<string, DocumentRow[]>): boolean {
  return Object.values(obj).every((arr) => arr.length === 0);
}
