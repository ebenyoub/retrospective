import type { RowDataPacket } from "mysql2";

export type ParticipantRole = "facilitator" | "participant";
export type ParticipantStatus = "online" | "offline";

export interface ParticipantRow extends RowDataPacket {
  id: number;
  session_id: number;
  user_id: number | null;
  guest_token: string | null;
  display_name: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joined_at: Date;
  last_seen_at: Date;
}

export interface InsertParticipantInput {
  sessionId: number;
  userId: number | null;
  guestToken: string | null;
  displayName: string;
  role: ParticipantRole;
}
