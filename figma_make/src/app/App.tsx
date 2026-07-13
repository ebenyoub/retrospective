import { useState, useCallback } from "react";
import { AppState, Screen, Card, Category, Comment, ActionItem } from "./types";
import { PARTICIPANTS, INITIAL_CARDS, INITIAL_COMMENTS, INITIAL_MESSAGES, INITIAL_ACTIONS } from "./mockData";
import { AppShell, NavBar, ParticipantsSidebar, useIsDesktop } from "./components/Shell";
import { DiscussionPanel } from "./components/DiscussionPanel";
import { CommentsModal } from "./components/CommentsModal";
import { HomeScreen } from "./screens/HomeScreen";
import { WaitingScreen } from "./screens/WaitingScreen";
import { WritingScreen } from "./screens/WritingScreen";
import { VoteScreen } from "./screens/VoteScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { ActionScreen } from "./screens/ActionScreen";
import { SummaryScreen } from "./screens/SummaryScreen";

const TOTAL_VOTES = 5;

function createInitialState(): AppState {
  return {
    screen: "home",
    screenHistory: [],
    cards: INITIAL_CARDS,
    comments: INITIAL_COMMENTS,
    messages: INITIAL_MESSAGES,
    actions: INITIAL_ACTIONS,
    votesLeft: TOTAL_VOTES,
    isDiscussionOpen: false,
    isParticipantsPanelOpen: false,
    commentsCardId: null,
    sessionName: "Sprint 42 – Revue",
    sessionStartTime: new Date(Date.now() - 38 * 60000),
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(createInitialState);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const isDesktop = useIsDesktop();

  const update = useCallback((partial: Partial<AppState>) => {
    setState(s => ({ ...s, ...partial }));
  }, []);

  const go = useCallback((screen: Screen) => {
    setState(s => ({ ...s, screen, screenHistory: [...s.screenHistory, s.screen] }));
  }, []);

  const back = useCallback(() => {
    setState(s => {
      const prev = s.screenHistory[s.screenHistory.length - 1] ?? "home";
      return { ...s, screen: prev, screenHistory: s.screenHistory.slice(0, -1) };
    });
  }, []);

  const addCard = useCallback((category: Category, content: string) => {
    setState(s => ({
      ...s,
      cards: [...s.cards, { id: Date.now(), author: "Moi", content, votes: 0, category, votedByMe: false, commentCount: 0 }],
    }));
  }, []);

  const vote = useCallback((id: number) => {
    setState(s => {
      if (s.votesLeft <= 0) return s;
      const card = s.cards.find(c => c.id === id);
      if (!card || card.votedByMe) return s;
      return { ...s, votesLeft: s.votesLeft - 1, cards: s.cards.map(c => c.id === id ? { ...c, votes: c.votes + 1, votedByMe: true } : c) };
    });
  }, []);

  const unvote = useCallback((id: number) => {
    setState(s => {
      const card = s.cards.find(c => c.id === id);
      if (!card || !card.votedByMe) return s;
      return { ...s, votesLeft: s.votesLeft + 1, cards: s.cards.map(c => c.id === id ? { ...c, votes: Math.max(0, c.votes - 1), votedByMe: false } : c) };
    });
  }, []);

  const sendMessage = useCallback((text: string) => {
    setState(s => ({
      ...s,
      messages: [...s.messages, { id: Date.now(), me: true, author: "Moi", text, time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }) }],
    }));
    if (!state.isDiscussionOpen) setUnreadMessages(u => u + 1);
  }, [state.isDiscussionOpen]);

  const addComment = useCallback((cardId: number, text: string) => {
    setState(s => ({
      ...s,
      comments: [...s.comments, { id: Date.now(), cardId, author: "Moi", text, time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }) }],
      cards: s.cards.map(c => c.id === cardId ? { ...c, commentCount: c.commentCount + 1 } : c),
    }));
  }, []);

  const addAction = useCallback((description: string, owner: string, priority: ActionItem["priority"], deadline: string) => {
    setState(s => ({ ...s, actions: [...s.actions, { id: Date.now(), description, owner, priority, deadline }] }));
  }, []);

  const { screen, isDiscussionOpen, isParticipantsPanelOpen, commentsCardId, cards, comments, messages, actions, votesLeft, sessionName, sessionStartTime } = state;

  const commentsCard = commentsCardId !== null ? cards.find(c => c.id === commentsCardId) ?? null : null;
  const showShell = screen !== "home";
  const totalComments = cards.reduce((s, c) => s + c.commentCount, 0);

  const openComments = (card: Card) => update({ commentsCardId: card.id });

  if (!showShell) {
    return (
      <>
        <HomeScreen
          onCreateSession={(name, retroName) => { update({ sessionName: retroName }); go("waiting"); }}
          onJoinSession={() => go("waiting")}
        />
        <style>{globalStyles}</style>
      </>
    );
  }

  const navbar = (
    <NavBar
      screen={screen}
      sessionName={sessionName}
      onBack={screen !== "waiting" ? back : undefined}
      isDiscussionOpen={isDiscussionOpen}
      onToggleDiscussion={() => update({ isDiscussionOpen: !isDiscussionOpen })}
      isParticipantsPanelOpen={isParticipantsPanelOpen}
      onToggleParticipants={() => update({ isParticipantsPanelOpen: !isParticipantsPanelOpen })}
      unreadMessages={unreadMessages}
      participants={PARTICIPANTS}
      isDesktop={isDesktop}
      rightSlot={
        screen === "waiting" ? (
          <button
            onClick={() => go("writing")}
            style={{ background: "#f8fafc", color: "#0f172a", border: "none", borderRadius: 9, padding: "5px 14px", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Démarrer →
          </button>
        ) : undefined
      }
    />
  );

  const leftPanel = (
    <ParticipantsSidebar
      participants={PARTICIPANTS}
      isOpen={isParticipantsPanelOpen}
      onClose={() => update({ isParticipantsPanelOpen: false })}
      isDesktop={isDesktop}
    />
  );

  const rightPanel = (
    <DiscussionPanel
      isOpen={isDiscussionOpen}
      onClose={() => update({ isDiscussionOpen: false })}
      messages={messages}
      onSend={sendMessage}
      isDesktop={isDesktop}
      onMarkRead={() => setUnreadMessages(0)}
    />
  );

  return (
    <>
      <AppShell navbar={navbar} leftPanel={isDesktop ? leftPanel : undefined} rightPanel={isDesktop ? rightPanel : undefined} isDesktop={isDesktop}>
        {/* Screen content */}
        {screen === "waiting" && (
          <WaitingScreen sessionName={sessionName} participants={PARTICIPANTS} onStart={() => go("writing")} isDesktop={isDesktop} />
        )}
        {screen === "writing" && (
          <WritingScreen cards={cards} onAddCard={addCard} onOpenComments={openComments} onNext={() => go("vote")} isDesktop={isDesktop} />
        )}
        {screen === "vote" && (
          <VoteScreen cards={cards} votesLeft={votesLeft} onVote={vote} onUnvote={unvote} onOpenComments={openComments} onNext={() => go("results")} isDesktop={isDesktop} />
        )}
        {screen === "results" && (
          <ResultsScreen cards={cards} onOpenComments={openComments} onNext={() => go("action")} isDesktop={isDesktop} />
        )}
        {screen === "action" && (
          <ActionScreen actions={actions} onAdd={addAction} onNext={() => go("summary")} isDesktop={isDesktop} />
        )}
        {screen === "summary" && (
          <SummaryScreen sessionName={sessionName} cards={cards} actions={actions} participants={PARTICIPANTS} startTime={sessionStartTime} totalComments={totalComments} isDesktop={isDesktop} onFinish={() => go("home")} />
        )}
      </AppShell>

      {/* Mobile panels (outside shell) */}
      {!isDesktop && (
        <>
          <ParticipantsSidebar participants={PARTICIPANTS} isOpen={isParticipantsPanelOpen} onClose={() => update({ isParticipantsPanelOpen: false })} isDesktop={false} />
          <DiscussionPanel isOpen={isDiscussionOpen} onClose={() => update({ isDiscussionOpen: false })} messages={messages} onSend={sendMessage} isDesktop={false} onMarkRead={() => setUnreadMessages(0)} />
        </>
      )}

      {/* Comments modal */}
      {commentsCard && (
        <CommentsModal
          card={commentsCard}
          comments={comments}
          onClose={() => update({ commentsCardId: null })}
          onAddComment={addComment}
          isDesktop={isDesktop}
        />
      )}

      <style>{globalStyles}</style>
    </>
  );
}

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; font-family: 'Inter', sans-serif; }
  body { background: #0f172a; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  input::placeholder, textarea::placeholder { color: #475569; }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;
