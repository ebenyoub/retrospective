import type { CreateActionPayload } from '../../services/actionApi';

// ActionStep consomme la majorité de ses données via useSessionContext()
// (voir SessionContext.ts). onAddAction reste une prop directe transmise par
// SessionDashboard : un seul niveau de passage, pas de drilling à traiter.
export interface ActionStepProps {
  onAddAction: (payload: CreateActionPayload) => Promise<void>;
}
