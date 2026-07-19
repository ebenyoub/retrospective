import type { GuestJoinResponse } from '../../types/participant.types';

export interface JoinSessionModalProps {
  sessionId: string;
  sessionName?: string;
  onJoined: (result: GuestJoinResponse) => void;
}
