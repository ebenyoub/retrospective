import { Request, Response } from "express";
import { logger } from "../utils/logger";
import db from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import crypto from "crypto";
import { SessionType } from "../types";


export const createSession = async (req: Request, res: Response) => {
  const { userId } = (req as any).user;

  if (!userId) {
    logger.error("❌ Données manquante : userId requis pour créer une session.");

    return res.status(401).json({
      success: false,
      message: "Impossible de créer la session : utilisateur non identifié"
    });
  }

  const now_utc = new Date().toISOString();

  const [result, field] = await db.execute<ResultSetHeader>(
    'update sessions set status = "closed" where owner_id = ? and expires_at <= ?',
    [userId, now_utc]
  )

  if (result.changedRows > 0) {
    logger.info(`🧹 ${result.affectedRows} session(s) expirée(s) fermée(s).`);
  }

  const [session] = await db.execute<(RowDataPacket & SessionType)[]>(
    'select * from sessions where owner_id = ? and status = "open" and expires_at > ?',
    [userId, now_utc]
  )

  if (session[0]) {
    logger.info(`✅ Session active récupérée. Code => ${session[0].code}`);
    return res.status(200).json({
      success: true,
      message: "Session active récupérée.",
      data: session[0]
    });
  }

  const code = crypto.randomInt(1000, 9999).toString();
  logger.info(`🔐 Nouveau code généré : ${code}`);

  try {
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const expires_at_mysql = expires_at
      .replace('T', ' ')      // Remplace le 'T' par un espace
      .replace(/\.\d{3}Z$/, '');

    const [result] = await db.execute<ResultSetHeader>(
      'insert into sessions (code, owner_id, status, expires_at) values(?, ?, ?, ?)',
      [code, userId, 'open', expires_at_mysql]
    )

    console.log("insert session", result)

    const sessionId = result.insertId;

    logger.info(`ℹ️sessionId : ${sessionId}`);

    return res.status(201).json({
      success: true,
      message: "Session créée.",
      data: {
        sessionId: sessionId,
        code: code,
        expiresAt: expires_at
      }
    })

  } catch (error) {
    logger.error(`❌ Erreur lors de la création de session : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création de la session."
    });
  }
}

