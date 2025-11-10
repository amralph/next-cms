import { RowDataPacket } from 'mysql2';

export type FieldType =
  | 'string'
  | 'file'
  | 'boolean'
  | 'number'
  | 'date'
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

export interface Template extends RowDataPacket {
  key: string;
  name?: string;
  fields: Field[];
}
