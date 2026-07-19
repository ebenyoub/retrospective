import type { RowDataPacket } from "mysql2";

export interface CommentRow extends RowDataPacket {
  id: number;
  card_id: number;
  author_participant_id: number;
  author_name: string;
  content: string;
  created_at: Date;
}

export interface CommentOwnerRow extends RowDataPacket {
  id: number;
  card_id: number;
  author_participant_id: number;
}
