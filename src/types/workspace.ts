import { RowDataPacket } from 'mysql2';

export interface Workspace extends RowDataPacket {
  id: number;
  name: string;
  user_id: number;
}
