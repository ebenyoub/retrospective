import type { RowDataPacket } from "mysql2";

export interface CardSessionRow extends RowDataPacket {
  session_id: number;
}

export interface ExistingVoteRow extends RowDataPacket {
  id: number;
}

export interface VoteCountRow extends RowDataPacket {
  count: number;
}
