export type SessionStep = 'waiting' | 'writing' | 'voting' | 'results' | 'action' | 'summary';

export type SessionRole = 'facilitator' | 'participant';

export interface SessionDetails {
  id: number;
  name: string;
  // Absent (null) dès que la session est clôturée : le code n'existe plus.
  joinCode: string | null;
  step?: SessionStep;
  status?: string;
  ownerId: number;
  formatName?: string;
  formatColumns?: string[] | string;
  stepDurationMinutes?: number;
  // Échéance absolue de l'étape en cours (ISO), calculée par le backend :
  // le frontend ne fait qu'afficher le temps restant jusqu'à cette date.
  stepEndsAt?: string | null;
}

export interface CreateSessionPayload {
  name: string;
  formatName: string;
  formatColumns: string[];
  stepDurationMinutes: number;
}

export interface CreatedSession {
  sessionId: number;
  joinCode: string;
  name: string;
}

export interface SessionListItem {
  id: number;
  name: string;
  // Absent (null) dès que la session est clôturée : le code n'existe plus.
  joinCode: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  role: SessionRole;
}
