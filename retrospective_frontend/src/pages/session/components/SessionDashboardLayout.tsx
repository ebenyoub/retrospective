import { useAuth } from '@/context/auth/useAuth';

import DiscussionDrawer from './DiscussionDrawer';
import ParticipantsDrawer from './ParticipantsDrawer';
import SessionActionBar from './SessionActionBar';
import SessionIdentityBar from './SessionIdentityBar';
import SessionNavigationBar from './SessionNavigationBar';
import { useSessionContext } from '../context/useSessionContext';
import ActionStep from '../steps/ActionStep';
import ResultsStep from '../steps/ResultsStep';
import SummaryStep from '../steps/SummaryStep';
import VotingStep from '../steps/VotingStep';
import WaitingStep from '../steps/WaitingStep';
import WritingStep from '../steps/WritingStep';
import type { SessionDashboardLayoutProps } from './types/SessionDashboardLayout.types';

const SessionDashboardLayout = ({
  isSessionCodeCopied,
  onCopySessionCode,
  onBack,
  writingColumns,
  onAddAction,
}: SessionDashboardLayoutProps) => {
  const { isAuthenticated } = useAuth();
  const { details, viewport } = useSessionContext();
  const activeStep = details.step;
  const isDesktopViewport = viewport.isDesktopViewport;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <SessionIdentityBar
        canRenameSelf={!isAuthenticated && details.status !== 'closed'}
        onBack={onBack}
        isDesktopViewport={isDesktopViewport}
      />
      <SessionNavigationBar
        isSessionCodeCopied={isSessionCodeCopied}
        onCopySessionCode={onCopySessionCode}
        isDesktopViewport={isDesktopViewport}
      />
      {activeStep === 'waiting' ? (
        // Discussion en docké (desktop) / overlay (mobile), comme sur les
        // autres étapes : le bouton "Discussion" de la navbar doit rester
        // utilisable pendant l'attente, pas seulement une fois la rétro lancée.
        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <WaitingStep />
          </div>

          <DiscussionDrawer />
        </div>
      ) : (
        <>
          <SessionActionBar
            isDesktopViewport={isDesktopViewport}
            isSessionCodeCopied={isSessionCodeCopied}
            onCopySessionCode={onCopySessionCode}
          />
          <ParticipantsDrawer />

          {/* Discussion en docké (desktop) : panneau à côté des cartes, pas
              par-dessus — on peut lire/commenter tout en discutant. */}
          <div className="relative flex flex-1 overflow-hidden">
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {activeStep === 'summary' ? (
                <SummaryStep />
              ) : activeStep === 'action' ? (
                <ActionStep onAddAction={onAddAction} />
              ) : activeStep === 'results' ? (
                <ResultsStep />
              ) : activeStep === 'voting' ? (
                <VotingStep columns={writingColumns} />
              ) : (
                <WritingStep columns={writingColumns} />
              )}
            </div>

            <DiscussionDrawer />
          </div>
        </>
      )}
    </div>
  );
};

export default SessionDashboardLayout;
