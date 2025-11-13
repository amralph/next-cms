import { RowDataPacket } from 'mysql2';

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

export interface Workspace extends RowDataPacket {
  id: string;
  name: string;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Document extends RowDataPacket {
  id: string;
  template_id: string;
  content: Content;
  created_at?: Date;
  updated_at?: Date;
}

type ReferenceType = 'document' | 'file';

export type Reference = {
  _type: 'reference';
  _referenceTo: ReferenceType;
  _referenceId: string;
};

export type ContentValue =
  | string
  | number
  | boolean
  | Reference
  | string[]
  | number[]
  | boolean[]
  | Reference[];

// Content is literally the content column in Documents
export type Content = Record<string, ContentValue>;
