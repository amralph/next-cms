import { Reference } from '@/types/extendsRowDataPacket';

export function hasKey(
  obj: unknown,
  key: string
): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

export function getStringField(
  content: unknown,
  key: string
): string | undefined {
  if (hasKey(content, key)) {
    const value = content[key];
    return value !== undefined ? String(value) : undefined;
  }
  return undefined;
}

export function isReferenceObject(obj: unknown): obj is Reference {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_type' in obj &&
    '_referenceId' in obj &&
    '_referenceTo' in obj &&
    (obj as Record<string, unknown>)._type === 'reference' &&
    typeof (obj as Record<string, unknown>)._referenceId === 'string'
  );
}
