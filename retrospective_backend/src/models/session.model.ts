import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from './db';
import { JoinRow, SessionLookupRow, SessionType } from "../types";

export type SessionRole = "facilitator" | "participant";

export interface SessionRow extends RowDataPacket {
  id: number;
  name: string;
  code: string;
  status: string;
  step: "waiting" | "writing" | "voting" | "results";
  expires_at: Date;
  created_at: Date;
  role: SessionRole;
}

export interface ExpiredSessionsResult {
  affectedRows: number;
  changedRows: number;
}

const SESSION_COLUMNS = "id, name, code, owner_id, status, step, format_name, format_columns, step_duration_minutes, step_ends_at, created_at, expires_at";

export const findSessionsForUser = async (userId: number): Promise<SessionRow[]> => {
  const [sessions] = await db.execute<SessionRow[]>(
    `select id, name, code, status, step, expires_at, created_at, 'facilitator' as role
     from sessions
     where owner_id = ?
     union
     select s.id, s.name, s.code, s.status, s.step, s.expires_at, s.created_at, 'participant' as role
     from sessions s
     inner join session_user su on su.session_id = s.id
     where su.user_id = ? and s.owner_id != ?
     order by created_at desc`,
    [userId, userId, userId]
  );

  return sessions;
};

export const closeExpiredSessionsForOwner = async (
  userId: number,
  nowUtc: string
): Promise<ExpiredSessionsResult> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set status = "closed" where owner_id = ? and expires_at <= ?',
    [userId, nowUtc]
  );

  return {
    affectedRows: result.affectedRows,
    changedRows: result.changedRows,
  };
};

export const closeActiveSessionsForOwner = async (
  userId: number
): Promise<{ affectedRows: number }> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set status = "closed" where owner_id = ? and status = "open"',
    [userId]
  );

  return {
    affectedRows: result.affectedRows,
  };
};

export const findActiveSessionForOwner = async (
  userId: number,
  nowUtc: string
): Promise<(RowDataPacket & SessionType) | null> => {
  const [session] = await db.execute<(RowDataPacket & SessionType)[]>(
    `select ${SESSION_COLUMNS} from sessions where owner_id = ? and status = "open" and expires_at > ?`,
    [userId, nowUtc]
  );

  return session[0] ?? null;
};

export const insertSession = async (
  name: string,
  code: string,
  userId: number,
  expiresAtMysql: string,
  formatName: string,
  formatColumns: string[],
  stepDurationMinutes: number
): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    'insert into sessions (name, code, owner_id, status, expires_at, format_name, format_columns, step_duration_minutes) values(?, ?, ?, ?, ?, ?, ?, ?)',
    [name, code, userId, 'open', expiresAtMysql, formatName, JSON.stringify(formatColumns), stepDurationMinutes]
  );

  return result.insertId;
};

export const findSessionByCode = async (code: string): Promise<SessionLookupRow | null> => {
  const [sessionRows] = await db.execute<SessionLookupRow[]>(
    'select id from sessions where code = ?',
    [code]
  );

  return sessionRows[0] ?? null;
};

export const findSessionUserJoin = async (
  userId: number,
  sessionId: number
): Promise<JoinRow | null> => {
  const [jointure] = await db.execute<JoinRow[]>(
    'select id, user_id, session_id from session_user where user_id = ? and session_id = ?',
    [userId, sessionId]
  );

  return jointure[0] ?? null;
};

export const insertSessionUserJoin = async (
  userId: number,
  sessionId: number
): Promise<{ affectedRows: number; insertId: number }> => {
  const [insertResult] = await db.execute<ResultSetHeader>(
    'insert into session_user (user_id, session_id) values(?, ?)',
    [userId, sessionId]
  );

  return {
    affectedRows: insertResult.affectedRows,
    insertId: insertResult.insertId,
  };
};

export const findSessionById = async (sessionId: number): Promise<(RowDataPacket & SessionType) | null> => {
  const [session] = await db.execute<(RowDataPacket & SessionType)[]>(
    `select ${SESSION_COLUMNS} from sessions where id = ?`,
    [sessionId]
  );

  return session[0] ?? null;
};

export const updateSessionStep = async (
  sessionId: number,
  step: "waiting" | "writing" | "voting" | "results",
  stepEndsAtMysql: string | null
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set step = ?, step_ends_at = ? where id = ?',
    [step, stepEndsAtMysql, sessionId]
  );

  return result.affectedRows > 0;
};

// Salle d'attente : le facilitateur remplace la durée par défaut des étapes.
export const updateSessionStepDuration = async (
  sessionId: number,
  stepDurationMinutes: number
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set step_duration_minutes = ? where id = ?',
    [stepDurationMinutes, sessionId]
  );

  return result.affectedRows > 0;
};

// Étape en cours : le facilitateur redéfinit l'échéance du timer.
export const updateSessionStepDeadline = async (
  sessionId: number,
  stepEndsAtMysql: string
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set step_ends_at = ? where id = ?',
    [stepEndsAtMysql, sessionId]
  );

  return result.affectedRows > 0;
};

export const updateSessionFormat = async (
  sessionId: number,
  formatName: string,
  formatColumns: string[]
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set format_name = ?, format_columns = ? where id = ?',
    [formatName, JSON.stringify(formatColumns), sessionId]
  );

  return result.affectedRows > 0;
};

export const closeSessionById = async (
  sessionId: number,
  ownerId: number
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set status = "closed" where id = ? and owner_id = ?',
    [sessionId, ownerId]
  );

  return result.affectedRows > 0;
};

export const updateSessionName = async (
  sessionId: number,
  ownerId: number,
  name: string
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    'update sessions set name = ? where id = ? and owner_id = ?',
    [name, sessionId, ownerId]
  );

  return result.affectedRows > 0;
};

export const deleteSessionById = async (
  sessionId: number,
  ownerId: number
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    'delete from sessions where id = ? and owner_id = ?',
    [sessionId, ownerId]
  );

  return result.affectedRows > 0;
};
