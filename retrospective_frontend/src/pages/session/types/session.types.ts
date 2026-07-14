export type SessionStep = 'waiting' | 'writing' | 'voting' | 'results';

export type SessionRole = 'facilitator' | 'participant';

export interface SessionDetails {
  id: number;
  name: string;
  code: string;
  step?: SessionStep;
  ownerId: number;
  formatName?: string;
  formatColumns?: string[] | string;
}

export interface CreateSessionPayload {
  name: string;
  formatName: string;
  formatColumns: string[];
}

export interface CreatedSession {
  sessionId: number;
  code: string;
  name: string;
}

export interface SessionListItem {
  id: number;
  name: string;
  code: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  role: SessionRole;
}
