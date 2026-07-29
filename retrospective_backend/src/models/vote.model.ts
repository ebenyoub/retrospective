import { ResultSetHeader } from "mysql2";
import db from "./db";
import type {
  AtomicVoteResult,
  CardSessionRow,
  CardVoteCountRow,
  ExistingVoteRow,
  IdRow,
  SessionVoteStateRow,
  VoteCountRow,
} from "./types/vote.model.types";

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

// La ligne du participant est verrouillée avant le décompte : deux requêtes
// simultanées du même participant sont donc sérialisées. La session est aussi
// verrouillée afin qu'un passage à l'étape suivante ne puisse pas s'intercaler
// entre la vérification de la phase et l'insertion.
export const insertVoteAtomically = async (
  participantId: number,
  sessionId: number,
  cardId: number
): Promise<AtomicVoteResult> => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [participantRows] = await connection.execute<IdRow[]>(
      "select id from session_participants where id = ? and session_id = ? for update",
      [participantId, sessionId]
    );
    if (!participantRows[0]) {
      await connection.rollback();
      return { ok: false, failure: "PARTICIPANT_NOT_IN_SESSION" };
    }

    const [cardRows] = await connection.execute<CardSessionRow[]>(
      "select session_id from retro_cards where id = ? for update",
      [cardId]
    );
    const cardSessionId = cardRows[0]?.session_id;
    if (cardSessionId === undefined) {
      await connection.rollback();
      return { ok: false, failure: "CARD_NOT_FOUND" };
    }
    if (cardSessionId !== sessionId) {
      await connection.rollback();
      return { ok: false, failure: "CARD_SESSION_MISMATCH" };
    }

    const [sessionRows] = await connection.execute<SessionVoteStateRow[]>(
      "select status, step from sessions where id = ? for update",
      [sessionId]
    );
    const session = sessionRows[0];
    if (!session || session.status !== "open") {
      await connection.rollback();
      return { ok: false, failure: "SESSION_CLOSED" };
    }
    if (session.step !== "voting") {
      await connection.rollback();
      return { ok: false, failure: "VOTING_NOT_OPEN" };
    }

    const [existingVoteRows] = await connection.execute<ExistingVoteRow[]>(
      "select id from votes where card_id = ? and participant_id = ?",
      [cardId, participantId]
    );
    if (existingVoteRows[0]) {
      await connection.rollback();
      return { ok: false, failure: "ALREADY_VOTED" };
    }

    const [voteCountRows] = await connection.execute<VoteCountRow[]>(
      `select count(*) as count
       from votes v
       inner join retro_cards rc on rc.id = v.card_id
       where v.participant_id = ? and rc.session_id = ?`,
      [participantId, sessionId]
    );
    if ((voteCountRows[0]?.count ?? 0) >= 5) {
      await connection.rollback();
      return { ok: false, failure: "VOTE_LIMIT_REACHED" };
    }

    const [insertResult] = await connection.execute<ResultSetHeader>(
      "insert into votes (card_id, participant_id) values (?, ?)",
      [cardId, participantId]
    );
    const votesUsed = (voteCountRows[0]?.count ?? 0) + 1;
    const [cardVoteCountRows] = await connection.execute<CardVoteCountRow[]>(
      "select count(*) as votes_count from votes where card_id = ?",
      [cardId]
    );

    await connection.commit();
    return {
      ok: true,
      voteId: insertResult.insertId,
      votesUsed,
      cardVotesCount: cardVoteCountRows[0]?.votes_count ?? 0,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
