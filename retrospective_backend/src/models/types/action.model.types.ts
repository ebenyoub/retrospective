import type { RowDataPacket } from "mysql2";

export interface ActionRow extends RowDataPacket {
  id: number;
  session_id: number;
  description: string;
  owner: string;
  deadline: Date | null;
  priority: "high" | "medium" | "low";
  created_at: Date;
}
