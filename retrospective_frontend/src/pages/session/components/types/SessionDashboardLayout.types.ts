import type { CreateActionPayload } from '../../services/actionApi';
import type { SessionBoardColumn } from '../../types/board.types';

// SessionDashboardLayout consomme la majorité de ses données via
// useSessionContext() (voir SessionContext.ts) : il est monté comme enfant
// du SessionContext.Provider construit par SessionDashboard. Seules les
// valeurs absentes du contexte restent des props directes.
export interface SessionDashboardLayoutProps {
  isSessionCodeCopied: boolean;
  onCopySessionCode: () => void;
  onBack: () => void;
  writingColumns: SessionBoardColumn[];
  onAddAction: (payload: CreateActionPayload) => Promise<void>;
}
