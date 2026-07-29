import { RowDataPacket } from "mysql2";

export interface MessageRow extends RowDataPacket {
  id: number;
  session_id: number;
  author_participant_id: number;
  author_name: string;
  content: string;
  created_at: Date;
}
