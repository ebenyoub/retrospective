import { findSessionsForUser, type SessionRole } from "./session.model";

export interface SessionListItem {
  id: number;
  code: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  role: SessionRole;
}

export const getSessionsForUser = async (userId: number): Promise<SessionListItem[]> => {
  const rows = await findSessionsForUser(userId);

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    role: row.role,
  }));
};
