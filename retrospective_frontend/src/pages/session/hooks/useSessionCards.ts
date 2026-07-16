import { useCallback, useMemo, useState } from 'react';

import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { createCard, deleteCard, getCards, updateCard, voteForCard } from '../services/cardApi';
import type { RetroCard } from '../types/card.types';
import type { UseSessionCardsOptions } from './types/useSessionCards.types';

export const useSessionCards = ({ sessionId, actorHeaders, addToast }: UseSessionCardsOptions) => {
  const [cards, setCards] = useState<RetroCard[]>([]);

  const votesUsed = useMemo(
    (): number => cards.filter((card) => card.votedByMe).length,
    [cards]
  );
  const votesLeft = useMemo((): number => Math.max(0, 5 - votesUsed), [votesUsed]);

  const fetchCards = useCallback(async (): Promise<void> => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === 'undefined' || isNaN(sessionIdNumber) || sessionIdNumber <= 0 || !actorHeaders) {
      return;
    }

    try {
      const result = await getCards(sessionId, actorHeaders);

      if (result.ok) {
        setCards(result.data);
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de charger les cartes.'));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [actorHeaders, addToast, sessionId]);

  const addCard = useCallback(async (
    columnType: RetroCard['columnType'],
    content: string
  ): Promise<void> => {
    if (!sessionId || !actorHeaders) return;

    try {
      const result = await createCard(sessionId, actorHeaders, content, columnType);

      if (result.ok) {
        await fetchCards();
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible d\'ajouter la carte.'));
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la carte :", error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, actorHeaders, fetchCards, addToast]);

  const vote = useCallback(async (cardId: number): Promise<void> => {
    if (!sessionId || !actorHeaders) return;

    try {
      const result = await voteForCard(sessionId, actorHeaders, cardId);

      if (result.ok) {
        await fetchCards();
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible d\'enregistrer le vote.'));
      }
    } catch (error) {
      console.error('Erreur lors du vote :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, actorHeaders, fetchCards, addToast]);

  const removeCard = useCallback(async (cardId: number): Promise<void> => {
    if (!sessionId || !actorHeaders) return;

    try {
      const result = await deleteCard(sessionId, actorHeaders, cardId);

      if (result.ok) {
        await fetchCards();
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de supprimer la carte.'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, actorHeaders, fetchCards, addToast]);

  const editCard = useCallback(async (cardId: number, content: string): Promise<boolean> => {
    if (!sessionId || !actorHeaders) return false;

    try {
      const result = await updateCard(sessionId, actorHeaders, cardId, content);

      if (result.ok) {
        await fetchCards();
        return true;
      }

      addToast('error', getApiErrorMessage(result.payload, 'Impossible de modifier la carte.'));
      return false;
    } catch (error) {
      console.error('Erreur lors de la modification de la carte :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
      return false;
    }
  }, [sessionId, actorHeaders, fetchCards, addToast]);

  return {
    cards,
    fetchCards,
    handleAddCard: addCard,
    handleDeleteCard: removeCard,
    handleUpdateCard: editCard,
    handleVote: vote,
    votesLeft,
  };
};
