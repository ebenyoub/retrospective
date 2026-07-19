import type { ParticipantRole } from "../../models/types/participant.model.types";

export interface ParticipantSummary {
  id: number;
  sessionId: number;
  displayName: string;
  role: ParticipantRole;
  status: "online" | "offline";
  joinedAt: Date;
  lastSeenAt: Date;
  isSelf?: boolean;
}

export interface GuestJoinResult {
  participant: ParticipantSummary;
  guestToken: string;
}
