import type { RowDataPacket } from "mysql2";

export interface IdRow extends RowDataPacket {
  id: number;
}

export interface CardSessionRow extends RowDataPacket {
  session_id: number;
}

export interface ExistingVoteRow extends RowDataPacket {
  id: number;
}

export interface VoteCountRow extends RowDataPacket {
  count: number;
}

export interface SessionVoteStateRow extends RowDataPacket {
  status: string;
  step: string;
}

export interface CardVoteCountRow extends RowDataPacket {
  votes_count: number;
}

export type AtomicVoteFailure =
  | "PARTICIPANT_NOT_IN_SESSION"
  | "CARD_NOT_FOUND"
  | "CARD_SESSION_MISMATCH"
  | "SESSION_CLOSED"
  | "VOTING_NOT_OPEN"
  | "ALREADY_VOTED"
  | "VOTE_LIMIT_REACHED";

export type AtomicVoteResult =
  | { ok: true; voteId: number; votesUsed: number; cardVotesCount: number }
  | { ok: false; failure: AtomicVoteFailure };
