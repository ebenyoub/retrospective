import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "./db";

export type ParticipantRole = "facilitator" | "participant";
export type ParticipantStatus = "online" | "offline";

export interface ParticipantRow extends RowDataPacket {
  id: number;
  session_id: number;
  user_id: number | null;
  guest_token: string | null;
  display_name: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joined_at: Date;
  last_seen_at: Date;
}

const PARTICIPANT_COLUMNS = "id, session_id, user_id, guest_token, display_name, role, status, joined_at, last_seen_at";

export const countParticipants = async (sessionId: number): Promise<number> => {
  const [rows] = await db.execute<(RowDataPacket & { total: number })[]>(
    "select count(*) as total from session_participants where session_id = ?",
    [sessionId]
  );

  return rows[0]?.total ?? 0;
};

export const findParticipantByName = async (
  sessionId: number,
  displayName: string
): Promise<ParticipantRow | null> => {
  const [rows] = await db.execute<ParticipantRow[]>(
    `select ${PARTICIPANT_COLUMNS} from session_participants where session_id = ? and display_name = ?`,
    [sessionId, displayName]
  );

  return rows[0] ?? null;
};

export const findParticipantByUserId = async (
  sessionId: number,
  userId: number
): Promise<ParticipantRow | null> => {
  const [rows] = await db.execute<ParticipantRow[]>(
    `select ${PARTICIPANT_COLUMNS} from session_participants where session_id = ? and user_id = ?`,
    [sessionId, userId]
  );

  return rows[0] ?? null;
};

export const findParticipantByGuestToken = async (
  sessionId: number,
  guestToken: string
): Promise<ParticipantRow | null> => {
  const [rows] = await db.execute<ParticipantRow[]>(
    `select ${PARTICIPANT_COLUMNS} from session_participants where session_id = ? and guest_token = ?`,
    [sessionId, guestToken]
  );

  return rows[0] ?? null;
};

export const findParticipantById = async (participantId: number): Promise<ParticipantRow | null> => {
  const [rows] = await db.execute<ParticipantRow[]>(
    `select ${PARTICIPANT_COLUMNS} from session_participants where id = ?`,
    [participantId]
  );

  return rows[0] ?? null;
};

export const findParticipantsBySession = async (sessionId: number): Promise<ParticipantRow[]> => {
  const [rows] = await db.execute<ParticipantRow[]>(
    `select ${PARTICIPANT_COLUMNS} from session_participants
     where session_id = ?
     order by field(role, 'facilitator', 'participant'), joined_at asc`,
    [sessionId]
  );

  return rows;
};

interface InsertParticipantInput {
  sessionId: number;
  userId: number | null;
  guestToken: string | null;
  displayName: string;
  role: ParticipantRole;
}

export const insertParticipant = async ({
  sessionId,
  userId,
  guestToken,
  displayName,
  role,
}: InsertParticipantInput): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    `insert into session_participants (session_id, user_id, guest_token, display_name, role, status, last_seen_at)
     values (?, ?, ?, ?, ?, 'online', now())`,
    [sessionId, userId, guestToken, displayName, role]
  );

  return result.insertId;
};

export const updateParticipantName = async (participantId: number, displayName: string): Promise<void> => {
  await db.execute<ResultSetHeader>(
    "update session_participants set display_name = ? where id = ?",
    [displayName, participantId]
  );
};

export const touchParticipant = async (participantId: number, status: ParticipantStatus): Promise<void> => {
  await db.execute<ResultSetHeader>(
    "update session_participants set status = ?, last_seen_at = now() where id = ?",
    [status, participantId]
  );
};

export const deleteParticipant = async (participantId: number): Promise<void> => {
  await db.execute<ResultSetHeader>("delete from session_participants where id = ?", [participantId]);
};
