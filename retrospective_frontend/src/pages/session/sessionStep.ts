import type { SessionStep } from './types/session.types';

export const SESSION_STEP_LABELS: Record<SessionStep, string> = {
  waiting: "Salle d'attente",
  writing: 'Écriture des cartes',
  voting: 'Vote',
  results: 'Résultats',
};

export const SESSION_STEPS: SessionStep[] = ['waiting', 'writing', 'voting', 'results'];
