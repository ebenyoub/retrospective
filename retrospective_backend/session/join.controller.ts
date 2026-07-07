import { ResultSetHeader } from "mysql2";
import db from "../db";
import { AuthRequest, JoinRow, SessionLookupRow } from "../types";
import { Response } from "express";
import { logger } from "../utils/logger";

const joinSession = async (request: AuthRequest, response: Response) => {
  const { userId } = request.user;
  const { code } = request.body;

  if (!code || !userId) {
    logger.error("❌ Le code de session et l'ID utilisateur sont requis.")
    return response.status(401).json({
      success: false,
      message: "Le code de session et l'ID utilisateur sont requis."
    })
  }

  const [sessionRows] = await db.execute<SessionLookupRow[]>(
    'select id from sessions where code = ?',
    [code]
  )

  const sessionData = sessionRows[0];

  if (!sessionData) {
    logger.error(`❌ Aucune session ne correcpond à ce code : ${code}`)
    return response.status(404).json({
      success: false,
      message: `Aucune session ne correcpond à ce code : ${code}`
    })
  }

  const sessionId = sessionData.id;
  logger.info(`ℹ️ Session récupéré pour jointure : ${sessionId}`)

  const [jointure] = await db.execute<JoinRow[]>(
    'select * from session_user where user_id = ? and session_id = ?',
    [userId, sessionId]
  )

  if (jointure.length > 0) {
    logger.warn(`⚠️ L'utilisateur ${userId} à déjà rejoint la session ${sessionId}`);

    return response.status(200).json({
      success: true,
      message: "Vous avez déjà rejoint cette session.",
      data: { joinId: jointure[0].id, sessionId: sessionId }
    })
  }

  const [insertResult] = await db.execute<ResultSetHeader>(
    'insert into session_user (user_id, session_id) values(?, ?)',
    [userId, sessionId]
  )

  if (insertResult.affectedRows === 0) {
    logger.error("❌ Échec de l'insertion dans session_user (lignes affectées: 0)");

    return response.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'enregistrement de la jointure de session."
    })
  }

  logger.info(`Insertion : ${insertResult.insertId}`)

  return response.status(201).json({
    success: true,
    message: "Session jointe avec succès.",
    data: { joinId: insertResult.insertId, sessionId: sessionId }
  })
}

export default joinSession; 
