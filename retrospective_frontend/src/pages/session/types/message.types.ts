export interface SessionMessage {
  id: number;
  sessionId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}
