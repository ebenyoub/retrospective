import { ResultSetHeader } from "mysql2";
import db from "./db";
import type { MessageRow } from "./types/message.model.types";

const MESSAGE_COLUMNS = "sm.id, sm.session_id, sm.author_participant_id, sp.display_name as author_name, sm.content, sm.created_at";

export const insertMessage = async (
  sessionId: number,
  participantId: number,
  content: string
): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into session_messages (session_id, author_participant_id, content) values (?, ?, ?)",
    [sessionId, participantId, content]
  );

  return result.insertId;
};

export const findMessagesBySessionId = async (sessionId: number): Promise<MessageRow[]> => {
  const [rows] = await db.execute<MessageRow[]>(
    `select ${MESSAGE_COLUMNS}
     from session_messages sm
     inner join session_participants sp on sp.id = sm.author_participant_id
     where sm.session_id = ?
     order by sm.created_at asc`,
    [sessionId]
  );

  return rows;
};

export const findMessageById = async (messageId: number): Promise<MessageRow | null> => {
  const [rows] = await db.execute<MessageRow[]>(
    `select ${MESSAGE_COLUMNS}
     from session_messages sm
     inner join session_participants sp on sp.id = sm.author_participant_id
     where sm.id = ?`,
    [messageId]
  );

  return rows[0] ?? null;
};
