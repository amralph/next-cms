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
  user_id: number;
  created_at: Date;
}

export interface Document extends RowDataPacket {
  id: string;
  template_id: string;
  content: Content;
  created_at: Date;
}

export type Content = Record<string, string | number | boolean>;
