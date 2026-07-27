import { useCallback, useState } from 'react';

export const useSessionPanels = () => {
  const [isParticipantsDrawerOpen, setIsParticipantsDrawerOpen] = useState<boolean>(false);
  const [isDiscussionDrawerOpen, setIsDiscussionDrawerOpen] = useState<boolean>(false);
  // Un seul panneau de commentaires ouvert à la fois, toutes cartes/colonnes
  // confondues : ouvrir celui d'une carte ferme automatiquement le précédent.
  const [openCommentsCardId, setOpenCommentsCardId] = useState<number | null>(null);

  const toggleComments = useCallback((cardId: number): void => {
    setOpenCommentsCardId((current) => (current === cardId ? null : cardId));
  }, []);

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
    closeDiscussionDrawer: (): void => setIsDiscussionDrawerOpen(false),
    closeParticipantsDrawer: (): void => setIsParticipantsDrawerOpen(false),
    isDiscussionDrawerOpen,
    isParticipantsDrawerOpen,
    openCommentsCardId,
    toggleComments,
    toggleDiscussionDrawer,
    toggleParticipantsDrawer,
  };
};
