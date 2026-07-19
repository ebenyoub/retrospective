export interface MessageSummary {
  id: number;
  sessionId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface CreateMessageInput {
  sessionId: number;
  participantId: number;
  content: string;
}
