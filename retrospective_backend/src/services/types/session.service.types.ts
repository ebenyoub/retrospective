import type { SessionType } from "../../types";
import type { SessionRole } from "../../models/types/session.model.types";

export interface SessionListItem {
  id: number;
  name: string;
  // Absent (null) dès que la session est clôturée : plus de code à afficher.
  joinCode: string | null;
  status: string;
  step: "waiting" | "writing" | "voting" | "results" | "action" | "summary";
  expiresAt: Date;
  createdAt: Date;
  role: SessionRole;
}

export interface CreateSessionInput {
  userId?: number;
  name?: unknown;
  formatName?: unknown;
  formatColumns?: unknown;
  stepDurationMinutes?: unknown;
}

export interface CreatedSessionResult {
  statusCode: 200 | 201;
  message: string;
  data: SessionType | {
    sessionId: number;
    name: string;
    joinCode: string;
    expiresAt: string;
  };
}

export interface JoinSessionInput {
  userId?: number;
  code: unknown;
}

export interface JoinSessionResult {
  statusCode: 200 | 201;
  message: string;
  data: {
    joinId: number;
    sessionId: number;
  };
}

export interface SessionDetails {
  id: number;
  name: string;
  // Absent (null) dès que la session est clôturée : plus de code à afficher.
  joinCode: string | null;
  status: string;
  step: "waiting" | "writing" | "voting" | "results" | "action" | "summary";
  ownerId: number;
  formatName: string;
  formatColumns: string[];
  stepDurationMinutes: number;
  stepEndsAt: Date | null;
  expiresAt: Date;
  closedAt: Date | null;
  createdAt: Date;
}
