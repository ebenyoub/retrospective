export interface RetroCard {
  id: number;
  sessionId: number;
  authorId: number;
  authorName: string;
  columnType: 'start' | 'stop' | 'continue';
  content: string;
  createdAt: string;
  votesCount: number;
  votedByMe?: boolean;
  commentsCount: number;
}
