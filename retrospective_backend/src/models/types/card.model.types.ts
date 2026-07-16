import type { RowDataPacket } from "mysql2";

export interface CardRow extends RowDataPacket {
  id: number;
  session_id: number;
  author_participant_id: number;
  author_name: string;
  column_type: string;
  content: string;
  created_at: Date;
  votes_count: number;
  voted_by_me?: number;
}

export interface CardOwnerRow extends RowDataPacket {
  id: number;
  author_participant_id: number;
}
