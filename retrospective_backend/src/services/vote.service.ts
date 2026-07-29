import { AppError } from "../utils/AppError";
import { insertVoteAtomically } from "../models/vote.model";
import type { CastVoteResult } from "./types/vote.service.types";

export const MAX_VOTES_PER_SESSION = 5;

export const castVote = async (
  participantId: number,
  sessionId: number,
  cardId: number
): Promise<CastVoteResult> => {
  const result = await insertVoteAtomically(participantId, sessionId, cardId);

  if (!result.ok) {
    const errors = {
      PARTICIPANT_NOT_IN_SESSION: [403, "Participant non autorisé dans cette session.", "PARTICIPANT_NOT_IN_SESSION"],
      CARD_NOT_FOUND: [404, "Carte introuvable.", "CARD_NOT_FOUND"],
      CARD_SESSION_MISMATCH: [404, "Carte introuvable dans cette session.", "CARD_SESSION_MISMATCH"],
      SESSION_CLOSED: [400, "Cette session est clôturée : elle est désormais en lecture seule.", "SESSION_CLOSED"],
      VOTING_NOT_OPEN: [400, "Le vote n'est ouvert qu'à l'étape de vote.", "VOTING_NOT_OPEN"],
      ALREADY_VOTED: [400, "Vous avez déjà voté pour cette carte.", "ALREADY_VOTED"],
      VOTE_LIMIT_REACHED: [400, "Limite de votes atteinte pour cette session.", "VOTE_LIMIT_REACHED"],
    } as const;
    const [statusCode, message, code] = errors[result.failure];
    throw new AppError(statusCode, message, code, result.failure === "VOTE_LIMIT_REACHED"
      ? { limit: MAX_VOTES_PER_SESSION }
      : undefined);
  }

  return {
    voteId: result.voteId,
    votesUsed: result.votesUsed,
    votesLeft: MAX_VOTES_PER_SESSION - result.votesUsed,
    cardVotesCount: result.cardVotesCount,
  };
};
