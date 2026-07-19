export type ColumnType = "start" | "stop" | "continue";

export interface CreateCardInput {
  participantId: number;
  sessionId: string;
  content: unknown;
  columnType: unknown;
}

export interface GetCardsInput {
  sessionId: string;
  participantId?: number | null;
}

export interface UpdateCardInput {
  participantId: number;
  sessionId: number;
  cardId: number;
  content: unknown;
}

export interface DeleteCardInput {
  participantId: number;
  cardId: string;
}
