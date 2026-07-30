import { useContext } from 'react';
import {
  SessionViewportContext,
  SessionDetailsContext,
  SessionIdentityContext,
  SessionPanelsContext,
  SessionCardsContext,
  SessionParticipantsContext,
  SessionChatContext,
  SessionActionsContext
} from './SessionContext';

export const useSessionViewportState = () => {
  const context = useContext(SessionViewportContext);
  if (!context) throw new Error('useSessionViewportState doit être utilisé dans un SessionViewportContext.Provider');
  return context;
};

export const useSessionDetailsState = () => {
  const context = useContext(SessionDetailsContext);
  if (!context) throw new Error('useSessionDetailsState doit être utilisé dans un SessionDetailsContext.Provider');
  return context;
};

export const useSessionIdentityState = () => {
  const context = useContext(SessionIdentityContext);
  if (!context) throw new Error('useSessionIdentityState doit être utilisé dans un SessionIdentityContext.Provider');
  return context;
};

export const useSessionPanelsState = () => {
  const context = useContext(SessionPanelsContext);
  if (!context) throw new Error('useSessionPanelsState doit être utilisé dans un SessionPanelsContext.Provider');
  return context;
};

export const useSessionCardsState = () => {
  const context = useContext(SessionCardsContext);
  if (!context) throw new Error('useSessionCardsState doit être utilisé dans un SessionCardsContext.Provider');
  return context;
};

export const useSessionParticipantsState = () => {
  const context = useContext(SessionParticipantsContext);
  if (!context) throw new Error('useSessionParticipantsState doit être utilisé dans un SessionParticipantsContext.Provider');
  return context;
};

export const useSessionChatState = () => {
  const context = useContext(SessionChatContext);
  if (!context) throw new Error('useSessionChatState doit être utilisé dans un SessionChatContext.Provider');
  return context;
};

export const useSessionActionsState = () => {
  const context = useContext(SessionActionsContext);
  if (!context) throw new Error('useSessionActionsState doit être utilisé dans un SessionActionsContext.Provider');
  return context;
};
