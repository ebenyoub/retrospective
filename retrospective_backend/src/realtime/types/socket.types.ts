import type { MessageSummary } from "../../services/types/message.service.types";
import type { ActionDetails } from "../../services/types/action.service.types";
import type { CommentSummary } from "../../services/types/comment.service.types";

export interface JoinPayload {
  sessionId: number;
  participantId: number;
  guestToken?: string;
  token?: string;
}

export interface StartedPayload {
  step: string;
  stepEndsAt: string | null;
}

export interface TimerUpdatedPayload {
  stepEndsAt: string;
}

export interface CommentAddedPayload {
  cardId: number;
  comment: CommentSummary;
}

export type { MessageSummary, ActionDetails, CommentSummary };
