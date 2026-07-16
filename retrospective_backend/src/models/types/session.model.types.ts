import type { RowDataPacket } from "mysql2";

export type SessionRole = "facilitator" | "participant";

export interface SessionRow extends RowDataPacket {
  id: number;
  name: string;
  code: string;
  status: string;
  step: "waiting" | "writing" | "voting" | "results";
  expires_at: Date;
  created_at: Date;
  role: SessionRole;
}

export interface ExpiredSessionsResult {
  affectedRows: number;
  changedRows: number;
}
