import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Response } from "express";
import db from "../db";
import { AuthRequest, SessionLookupRow } from "../types";
import { logger } from "../utils/logger";

interface CardRow extends RowDataPacket {
  id: number;
  session_id: number;
  author_id: number;
  column_type: string;
  content: string;
  created_at: Date;
}

type ColumnType = "start" | "stop" | "continue";

const VALID_COLUMN_TYPES: ColumnType[] = ["start", "stop", "continue"];

const isValidColumnType = (value: unknown): value is ColumnType =>
  typeof value === "string" && VALID_COLUMN_TYPES.includes(value as ColumnType);

export const createCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const { sessionId } = req.params;
  const { content, columnType } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    logger.error("❌ Le contenu de la carte est requis.");
    return res.status(400).json({
      success: false,
      message: "Le contenu de la carte est requis."
    });
  }

  if (!isValidColumnType(columnType)) {
    logger.error("❌ Colonne invalide.");
    return res.status(400).json({
      success: false,
      message: "La colonne doit être 'start', 'stop' ou 'continue'."
    });
  }

  try {
    const [sessionRows] = await db.execute<SessionLookupRow[]>(
      "select id from sessions where id = ?",
      [sessionId]
    );

    if (!sessionRows.length) {
      logger.error(`❌ Session introuvable : ${sessionId}`);
      return res.status(404).json({
        success: false,
        message: "Session introuvable."
      });
    }

    const [result] = await db.execute<ResultSetHeader>(
      "insert into retro_cards (session_id, author_id, column_type, content) values (?, ?, ?, ?)",
      [sessionId, userId, columnType, content]
    );

    logger.info(`✅ Carte créée : ${result.insertId}`);

    return res.status(201).json({
      success: true,
      message: "Carte ajoutée.",
      data: { cardId: result.insertId }
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la création de la carte : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création de la carte."
    });
  }
};

export const getCards = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;

  try {
    const [sessionRows] = await db.execute<SessionLookupRow[]>(
      "select id from sessions where id = ?",
      [sessionId]
    );

    if (!sessionRows.length) {
      logger.error(`❌ Session introuvable : ${sessionId}`);
      return res.status(404).json({
        success: false,
        message: "Session introuvable."
      });
    }

    const [cards] = await db.execute<CardRow[]>(
      "select id, session_id, author_id, column_type, content, created_at from retro_cards where session_id = ? order by created_at asc",
      [sessionId]
    );

    const data = cards.map((card) => ({
      id: card.id,
      sessionId: card.session_id,
      authorId: card.author_id,
      columnType: card.column_type,
      content: card.content,
      createdAt: card.created_at
    }));

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la récupération des cartes : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des cartes."
    });
  }
};
