export type FieldType =
  | 'string'
  | 'richText'
  | 'file'
  | 'boolean'
  | 'number'
  | 'date'
  | 'dateTime'
  | 'time'
  | 'reference'
  | 'array';

type ArrayFieldType = Exclude<FieldType, 'array'>;

export interface Field {
  key: string;
  name: string;
  type: FieldType;
  description?: string;
  // Only present if type === 'array'
  arrayOf?: ArrayFieldType;
}

export interface TemplateJSON {
  key: string;
  name: string;
  fields: Field[];
}

export interface TemplateRow {
  id?: string;
  template?: TemplateJSON;
  workspaceId?: string;
  created_at?: Date;
  updated_at?: Date;
}
