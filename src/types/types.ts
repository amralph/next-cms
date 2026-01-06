// misc

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

// workspace

export type WorkspaceRow = {
  id?: string;
  user_id?: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  public_key?: string;
  private?: boolean;
};

// template

export type TemplateJSON = {
  key: string;
  name: string;
  fields: Field[];
};

export type TemplateRow = {
  id?: string;
  key?: string;
  template?: TemplateJSON;
  workspaceId?: string;
  created_at?: Date;
  updated_at?: Date;
};

// document
export type DocumentRow = {
  id?: string;
  template_id?: string;
  workspace_id?: string;
  content?: unknown;
  created_at?: Date;
  updated_at?: Date;
};

export type SignedDocumentRow = DocumentRow & {
  signedContent: unknown;
};

type ReferenceType = 'document';

export type Reference = {
  _type: 'reference';
  _referenceTo: ReferenceType;
  _referenceId: string;
};

export type File = {
  _type: 'file';
  _fileId: string;
};

export type FileWithSignedUrl = File & {
  __signedUrl: string;
};

export type SignedFile = {
  id: string;
  filePath: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: Date;
    contentLength: number;
    httpStatusCode: number;
  };
  originalName: string;
  signedUrl: string;
};

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

export type ArrayFieldType = Exclude<FieldType, 'array'>;

export type BaseField = {
  key: string;
  name: string;
  description?: string;
};

export type Field = BaseField &
  (
    | {
        type: Exclude<FieldType, 'array' | 'reference'>;
      }
    | {
        type: 'array';
        arrayOf?: ArrayFieldType;
      }
    | {
        type: 'reference';
        referenceTo?: string[];
      }
  );

// type guards

type ValidContentJSON = {
  _createdAt: Date;
  _updatedAt: Date;
  _documentId: string;
  _templateId: string;
  _templateKey: string;
  [key: string]: unknown;
};

type ValidDocumentRow = Omit<DocumentRow, 'content'> & {
  content: ValidContentJSON;
  id: string; // make required if you want
};

export function isValidContentJSON(obj: unknown): obj is ValidDocumentRow {
  if (typeof obj !== 'object' || obj === null) return false;

  const o = obj as Record<string, unknown>;

  return (
    typeof o.id === 'string' &&
    typeof o.template_id === 'string' &&
    typeof o.workspace_id === 'string' &&
    typeof o.content === 'object' &&
    typeof o.created_at === 'string' &&
    typeof o.updated_at === 'string'
  );
}

export type FileMetadata = {
  userId: string;
  originalName: string;
};

export type FileData = {
  id: string;
  name: string;
  version: string;
  bucketId: string;
  size: number;
  contentType: string;
  cacheControl: string;
  etag: string;
  metadata: FileMetadata;
  lastModified: string; // ISO date string
  createdAt: string; // ISO date string
};

export type FileResponse = {
  data: FileData;
};

export type Role = 'admin' | 'editor' | 'viewer';

export type Collaborator = {
  user_id: string;
  workspace_id: string;
  created_at: string; // ISO date string
  role: Role;
  email: string;
};
