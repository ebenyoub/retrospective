import type { ParticipantSummary } from '../types/participant.types';
import type { SessionRole } from '../types/session.types';
import { WaitingScreen } from '../components/WaitingScreen';

interface WaitingStepProps {
  sessionId: string;
  sessionName: string;
  sessionCode: string;
  participants: ParticipantSummary[];
  selfParticipantId: number | null;
  role: SessionRole | null;
  formatName: string;
  isDesktop: boolean;
  onStart: () => void;
  onLeave: () => void | Promise<void>;
  onSelectFormatPreset: (nextName: string, nextColumns: string[]) => void | Promise<void>;
}

const WaitingStep = ({
  sessionId,
  sessionName,
  sessionCode,
  participants,
  selfParticipantId,
  role,
  formatName,
  isDesktop,
  onStart,
  onLeave,
  onSelectFormatPreset,
}: WaitingStepProps) => {
  if (!selfParticipantId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-400">Connexion à la salle d'attente...</p>
      </div>
    );
  }

  return (
    <WaitingScreen
      sessionId={sessionId}
      sessionName={sessionName}
      sessionCode={sessionCode}
      participants={participants}
      selfParticipantId={selfParticipantId}
      role={role || 'participant'}
      formatName={formatName}
      onStart={onStart}
      onLeave={onLeave}
      onSelectFormatPreset={onSelectFormatPreset}
      isDesktop={isDesktop}
    />
  );
};

export default WaitingStep;
