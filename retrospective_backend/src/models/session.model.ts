import { RowDataPacket } from "mysql2";
import db from './db';

export type SessionRole = "facilitator" | "participant";

export interface SessionRow extends RowDataPacket {
  id: number;
  code: string;
  status: string;
  expires_at: Date;
  created_at: Date;
  role: SessionRole;
}

export const findSessionsForUser = async (userId: number): Promise<SessionRow[]> => {
  const [sessions] = await db.execute<SessionRow[]>(
    `select id, code, status, expires_at, created_at, 'facilitator' as role
     from sessions
     where owner_id = ?
     union
     select s.id, s.code, s.status, s.expires_at, s.created_at, 'participant' as role
     from sessions s
     inner join session_user su on su.session_id = s.id
     where su.user_id = ? and s.owner_id != ?
     order by created_at desc`,
    [userId, userId, userId]
  );

  return sessions;
};
