import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "./db";
import { SessionLookupRow } from "../types";

export interface CardRow extends RowDataPacket {
  id: number;
  session_id: number;
  author_participant_id: number;
  author_name: string;
  column_type: string;
  content: string;
  created_at: Date;
  votes_count: number;
}

export interface CardOwnerRow extends RowDataPacket {
  id: number;
  author_participant_id: number;
}

export const findSessionById = async (sessionId: number | string): Promise<SessionLookupRow | null> => {
  const [rows] = await db.execute<SessionLookupRow[]>(
    "select id from sessions where id = ?",
    [sessionId]
  );

  return rows[0] ?? null;
};

export const insertCard = async (
  sessionId: number | string,
  participantId: number,
  columnType: string,
  content: string
): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into retro_cards (session_id, author_participant_id, column_type, content) values (?, ?, ?, ?)",
    [sessionId, participantId, columnType, content]
  );

  return result.insertId;
};

export const findCardsBySessionId = async (sessionId: number | string): Promise<CardRow[]> => {
  const [cards] = await db.execute<CardRow[]>(
    `select rc.id, rc.session_id, rc.author_participant_id, sp.display_name as author_name,
            rc.column_type, rc.content, rc.created_at,
            count(v.id) as votes_count
     from retro_cards rc
     inner join session_participants sp on sp.id = rc.author_participant_id
     left join votes v on v.card_id = rc.id
     where rc.session_id = ?
     group by rc.id
     order by rc.created_at asc`,
    [sessionId]
  );

  return cards;
};

export const findCardOwner = async (
  sessionId: number,
  cardId: number
): Promise<CardOwnerRow | null> => {
  const [rows] = await db.execute<CardOwnerRow[]>(
    "select id, author_participant_id from retro_cards where id = ? and session_id = ?",
    [cardId, sessionId]
  );

  return rows[0] ?? null;
};

export const findCardOwnerById = async (cardId: number | string): Promise<CardOwnerRow | null> => {
  const [rows] = await db.execute<CardOwnerRow[]>(
    "select id, author_participant_id from retro_cards where id = ?",
    [cardId]
  );

  return rows[0] ?? null;
};

export const updateCardContent = async (
  sessionId: number,
  cardId: number,
  content: string
): Promise<void> => {
  await db.execute(
    "update retro_cards set content = ? where id = ? and session_id = ?",
    [content, cardId, sessionId]
  );
};

export const deleteVotesByCardId = async (cardId: number | string): Promise<void> => {
  await db.execute("delete from votes where card_id = ?", [cardId]);
};

export const deleteCardById = async (cardId: number | string): Promise<void> => {
  await db.execute("delete from retro_cards where id = ?", [cardId]);
};
