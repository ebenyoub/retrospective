import type { SessionMessage } from '../../types/message.types';

export interface DiscussionDrawerProps {
  isOpen: boolean;
  isDesktop: boolean;
  onClose: () => void;
  messages: SessionMessage[];
  sessionId: string;
  actorHeaders: Record<string, string>;
  onMessageSent: (message: SessionMessage) => void;
}

