import { AppError } from "../utils/AppError";
import {
  countVotesByUserInSession,
  findCardSessionId,
  findExistingVote,
  insertVote,
} from "../models/vote.model";

export const MAX_VOTES_PER_SESSION = 5;

export interface CastVoteResult {
  voteId: number;
}

export const castVote = async (userId: number, cardId: number): Promise<CastVoteResult> => {
  const sessionId = await findCardSessionId(cardId);

  if (sessionId === null) {
    throw new AppError(404, "Carte introuvable", "CARD_NOT_FOUND");
  }

  const existingVote = await findExistingVote(cardId, userId);

  if (existingVote !== null) {
    throw new AppError(400, "Vous avez déjà voté pour cette carte", "ALREADY_VOTED");
  }

  const votesUsed = await countVotesByUserInSession(userId, sessionId);

  if (votesUsed >= MAX_VOTES_PER_SESSION) {
    throw new AppError(400, "Limite de votes atteinte pour cette session", "VOTE_LIMIT_REACHED", {
      limit: MAX_VOTES_PER_SESSION,
    });
  }

  const voteId = await insertVote(cardId, userId);

  return { voteId };
};
