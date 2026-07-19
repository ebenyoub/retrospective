import { WaitingScreen } from '../components/WaitingScreen';
import type { WaitingStepProps } from './types/WaitingStep.types';

const WaitingStep = ({
  sessionId,
  sessionName,
  sessionCode,
  participants,
  selfParticipantId,
  role,
  formatName,
  stepDurationMinutes,
  isDesktop,
  onStart,
  onLeave,
  onSelectFormatPreset,
  onUpdateStepDuration,
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
      stepDurationMinutes={stepDurationMinutes}
      onStart={onStart}
      onLeave={onLeave}
      onSelectFormatPreset={onSelectFormatPreset}
      onUpdateStepDuration={onUpdateStepDuration}
      isDesktop={isDesktop}
    />
  );
};

export default WaitingStep;
