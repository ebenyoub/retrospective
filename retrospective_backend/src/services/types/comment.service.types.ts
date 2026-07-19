export interface CreateCommentInput {
  participantId: number;
  sessionId: number;
  cardId: number;
  content: unknown;
}

export interface DeleteCommentInput {
  participantId: number;
  cardId: number;
  commentId: number;
}

export interface CommentSummary {
  id: number;
  cardId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: Date;
}
