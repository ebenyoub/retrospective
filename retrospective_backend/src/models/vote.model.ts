import { ResultSetHeader } from "mysql2";
import db from "./db";
import type { CardSessionRow, ExistingVoteRow, VoteCountRow } from "./types/vote.model.types";

export const findCardSessionId = async (cardId: number): Promise<number | null> => {
  const [rows] = await db.execute<CardSessionRow[]>(
    "select session_id from retro_cards where id = ?",
    [cardId]
  );

  return rows[0]?.session_id ?? null;
};

export const findExistingVote = async (cardId: number, participantId: number): Promise<number | null> => {
  const [rows] = await db.execute<ExistingVoteRow[]>(
    "select id from votes where card_id = ? and participant_id = ?",
    [cardId, participantId]
  );

  return rows[0]?.id ?? null;
};

export const countVotesByParticipantInSession = async (participantId: number, sessionId: number): Promise<number> => {
  const [rows] = await db.execute<VoteCountRow[]>(
    `select count(*) as count
     from votes v
     inner join retro_cards rc on rc.id = v.card_id
     where v.participant_id = ? and rc.session_id = ?`,
    [participantId, sessionId]
  );

  return rows[0]?.count ?? 0;
};

export const insertVote = async (cardId: number, participantId: number): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into votes (card_id, participant_id) values (?, ?)",
    [cardId, participantId]
  );

  return result.insertId;
};
