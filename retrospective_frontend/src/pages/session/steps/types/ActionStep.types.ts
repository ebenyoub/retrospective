import type { ActionItem } from '../../types/action.types';
import type { CreateActionPayload } from '../../services/actionApi';
import type { RetroCard } from '../../types/card.types';

export interface ActionStepProps {
  actions: ActionItem[];
  cards: RetroCard[];
  formatColumns: string[];
  isFacilitator: boolean;
  isDesktop: boolean;
  onAddAction: (payload: CreateActionPayload) => Promise<void>;
}
