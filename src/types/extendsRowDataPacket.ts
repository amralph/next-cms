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

export interface Template extends RowDataPacket {
  id: string;
  name: string;
  workspace_id: string;
  created_at: Date;
  template: JSONValue[];
}

export interface Document extends RowDataPacket {
  id: string;
  template_id: string;
  content: JSONValue[];
  created_at: Date;
}
