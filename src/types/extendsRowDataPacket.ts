import { RowDataPacket } from 'mysql2';

export interface Workspace extends RowDataPacket {
  id: number;
  name: string;
  user_id: number;
}

export interface Template extends RowDataPacket {
  id: number;
  name: string;
  workspace_id: string;
}
