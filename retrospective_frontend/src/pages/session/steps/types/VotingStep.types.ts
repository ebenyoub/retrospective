import type { SessionBoardColumn } from '../../types/board.types';

// VotingStep consomme le reste de ses données via useSessionContext() (voir
// SessionContext.ts) : seule `columns` reste une prop, car c'est une config
// d'affichage locale à SessionDashboard (dérivée du format), pas un état de
// session à faire transiter par le contexte.
export interface VotingStepProps {
  columns: SessionBoardColumn[];
}
