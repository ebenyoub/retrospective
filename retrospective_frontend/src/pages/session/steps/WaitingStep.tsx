import { WaitingScreen } from '../components/WaitingScreen';
import { useSessionContext } from '../context/useSessionContext';

const WaitingStep = () => {
  const {
    sessionId,
    details,
    participants,
    identity,
    viewport,
    handleLeaveSession,
    handleUpdateFormat,
    handleUpdateTimer,
    handleTransitionStep,
  } = useSessionContext();
  const selfParticipantId = identity.selfParticipantId;

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
      sessionName={details.sessionName}
      sessionCode={details.sessionCode}
      participants={participants}
      selfParticipantId={selfParticipantId}
      role={identity.role || 'participant'}
      formatName={details.formatName}
      stepDurationMinutes={details.stepDurationMinutes}
      onStart={() => handleTransitionStep('writing')}
      onLeave={handleLeaveSession}
      onSelectFormatPreset={handleUpdateFormat}
      onUpdateStepDuration={handleUpdateTimer}
      isDesktop={viewport.isDesktop}
    />
  );
};

export default WaitingStep;
