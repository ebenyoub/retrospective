import { WaitingScreen } from '../components/WaitingScreen';
import { useSessionDetailsState, useSessionIdentityState, useSessionParticipantsState, useSessionActionsState, useSessionViewportState } from '../context/useSessionContext';

const WaitingStep = () => {
  const { details, sessionId } = useSessionDetailsState();
  const { participants } = useSessionParticipantsState();
  const { identity } = useSessionIdentityState();
  const viewport = useSessionViewportState();
  const { handleLeaveSession, handleUpdateFormat, handleUpdateTimer, handleTransitionStep } = useSessionActionsState();
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
