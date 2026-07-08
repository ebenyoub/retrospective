import { RowDataPacket } from "mysql2";
import db from "./db";

export interface CardOwnerRow extends RowDataPacket {
  id: number;
  author_id: number;
}

export const findCardOwnerInSession = async (
  cardId: number,
  sessionId: number
): Promise<CardOwnerRow | null> => {
  const [rows] = await db.execute<CardOwnerRow[]>(
    "select id, author_id from retro_cards where id = ? and session_id = ?",
    [cardId, sessionId]
  );

  return rows[0] ?? null;
};

export const updateCardContent = async (
  cardId: number,
  sessionId: number,
  content: string
): Promise<void> => {
  await db.execute(
    "update retro_cards set content = ? where id = ? and session_id = ?",
    [content, cardId, sessionId]
  );
};
