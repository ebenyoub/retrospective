import { useCallback, useState } from 'react';

import type { RetroCard } from '../types/card.types';

export const useSessionPanels = () => {
  const [isParticipantsDrawerOpen, setIsParticipantsDrawerOpen] = useState<boolean>(false);
  const [isDiscussionDrawerOpen, setIsDiscussionDrawerOpen] = useState<boolean>(false);
  const [commentsCard, setCommentsCard] = useState<RetroCard | null>(null);

  const toggleParticipantsDrawer = useCallback((): void => {
    setIsParticipantsDrawerOpen((isOpen) => {
      if (!isOpen) setIsDiscussionDrawerOpen(false);
      return !isOpen;
    });
  }, []);

  const toggleDiscussionDrawer = useCallback((): void => {
    setIsDiscussionDrawerOpen((isOpen) => {
      if (!isOpen) setIsParticipantsDrawerOpen(false);
      return !isOpen;
    });
  }, []);

  return {
    closeComments: (): void => setCommentsCard(null),
    closeDiscussionDrawer: (): void => setIsDiscussionDrawerOpen(false),
    closeParticipantsDrawer: (): void => setIsParticipantsDrawerOpen(false),
    commentsCard,
    isDiscussionDrawerOpen,
    isParticipantsDrawerOpen,
    openComments: setCommentsCard,
    toggleDiscussionDrawer,
    toggleParticipantsDrawer,
  };
};
