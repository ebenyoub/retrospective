import type { SessionMessage } from '../../types/message.types';

// DiscussionDrawer consomme désormais l'essentiel de ses données via
// useSessionContext() (voir SessionContext.ts) : seul le contenu partagé
// entre le mode docké (desktop) et le mode overlay (mobile) garde une
// interface de props, portée en interne par DiscussionDrawer lui-même.
export interface DiscussionPanelContentProps {
  onClose: () => void;
  messages: SessionMessage[];
  sessionId: string;
  actorHeaders: Record<string, string>;
  onMessageSent: (message: SessionMessage) => void;
}

