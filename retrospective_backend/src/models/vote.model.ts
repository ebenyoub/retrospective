import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "./db";

interface CardSessionRow extends RowDataPacket {
  session_id: number;
}

interface ExistingVoteRow extends RowDataPacket {
  id: number;
}

interface VoteCountRow extends RowDataPacket {
  count: number;
}

export const findCardSessionId = async (cardId: number): Promise<number | null> => {
  const [rows] = await db.execute<CardSessionRow[]>(
    "select session_id from retro_cards where id = ?",
    [cardId]
  );

  return rows[0]?.session_id ?? null;
};

export const findExistingVote = async (cardId: number, userId: number): Promise<number | null> => {
  const [rows] = await db.execute<ExistingVoteRow[]>(
    "select id from votes where card_id = ? and user_id = ?",
    [cardId, userId]
  );

  return rows[0]?.id ?? null;
};

export const countVotesByUserInSession = async (userId: number, sessionId: number): Promise<number> => {
  const [rows] = await db.execute<VoteCountRow[]>(
    `select count(*) as count
     from votes v
     inner join retro_cards rc on rc.id = v.card_id
     where v.user_id = ? and rc.session_id = ?`,
    [userId, sessionId]
  );

  return rows[0]?.count ?? 0;
};

export const insertVote = async (cardId: number, userId: number): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into votes (card_id, user_id) values (?, ?)",
    [cardId, userId]
  );

  return result.insertId;
};
