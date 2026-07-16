import type { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  userId?: number;
  username?: string;
}

export interface SessionActor {
  participantId: number;
  displayName: string;
  role: "facilitator" | "participant";
}
