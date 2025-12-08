import { RowDataPacket } from 'mysql2';

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

export interface WorkspaceRow {
  id?: string;
  user_id?: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  public_key?: string;
  private?: boolean;
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
export type Content = unknown;

export type StorageObject = {
  id: string;
  bucket_id: string;
  name: string;
  owner: string;
  created_at: Date;
  updated_at: Date;
  last_accessed_at: Date;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: Date;
    contentLength: number;
    httpStatusCode: number;
  };
  path_tokens: string[];
  version: string;
  owner_id: string;
  user_metadata: { originalName: string };
  level: number;
};
