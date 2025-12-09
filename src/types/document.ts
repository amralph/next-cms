import { Content } from './extendsRowDataPacket';
import { TemplateJSON } from './template';

export interface DocumentContainer {
  id: string;
  content: Content;
  template: TemplateJSON;
}

export interface DocumentRow {
  id?: string;
  template_id?: string;
  workspace_id?: string;
  content?: unknown;
  created_at?: Date;
  updated_at?: Date;
}

export interface SignedDocumentRow extends DocumentRow {
  signedContent: unknown;
}
