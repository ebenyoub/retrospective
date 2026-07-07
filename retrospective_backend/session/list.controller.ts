import { RowDataPacket } from "mysql2";
import { Response } from "express";
import db from "../db";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

type SessionRole = "facilitator" | "participant";

interface SessionListRow extends RowDataPacket {
  id: number;
  code: string;
  status: string;
  expires_at: Date;
  created_at: Date;
  role: SessionRole;
}

export const listSessions = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;

  try {
    const [sessions] = await db.execute<SessionListRow[]>(
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

    const data = sessions.map((session) => ({
      id: session.id,
      code: session.code,
      status: session.status,
      expiresAt: session.expires_at,
      createdAt: session.created_at,
      role: session.role,
    }));

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la récupération des sessions : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des sessions."
    });
  }
};
