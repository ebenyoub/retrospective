export interface UseSessionCardsOptions {
  sessionId: string;
  actorHeaders: Record<string, string> | null;
  addToast: (type: 'error', message: string) => void;
}
