import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Response } from "express";
import db from '../models/db';
import { AuthRequest, SessionLookupRow } from '../types';
import { logger } from '../utils/logger';

interface CardRow extends RowDataPacket {
  id: number;
  session_id: number;
  author_id: number;
  column_type: string;
  content: string;
  created_at: Date;
  votes_count: number;
}

interface CardOwnerRow extends RowDataPacket {
  id: number;
  author_id: number;
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
      `select rc.id, rc.session_id, rc.author_id, rc.column_type, rc.content, rc.created_at,
              count(v.id) as votes_count
       from retro_cards rc
       left join votes v on v.card_id = rc.id
       where rc.session_id = ?
       group by rc.id
       order by rc.created_at asc`,
      [sessionId]
    );

    const data = cards.map((card) => ({
      id: card.id,
      sessionId: card.session_id,
      authorId: card.author_id,
      columnType: card.column_type,
      content: card.content,
      createdAt: card.created_at,
      votesCount: card.votes_count
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

export const updateCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const { sessionId, cardId } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    logger.error("❌ Le contenu de la carte est requis.");
    return res.status(400).json({
      success: false,
      message: "Le contenu de la carte est requis."
    });
  }

  try {
    const [cardRows] = await db.execute<CardOwnerRow[]>(
      "select id, author_id from retro_cards where id = ? and session_id = ?",
      [cardId, sessionId]
    );

    if (!cardRows.length) {
      logger.error(`❌ Carte introuvable : ${cardId}`);
      return res.status(404).json({
        success: false,
        message: "Carte introuvable."
      });
    }

    if (cardRows[0].author_id !== userId) {
      logger.error(`❌ L'utilisateur ${userId} n'est pas l'auteur de la carte ${cardId}`);
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez modifier que vos propres cartes."
      });
    }

    await db.execute(
      "update retro_cards set content = ? where id = ? and session_id = ?",
      [content.trim(), cardId, sessionId]
    );

    logger.info(`✅ Carte modifiée : ${cardId}`);

    return res.status(200).json({
      success: true,
      message: "Carte modifiée."
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la modification de la carte : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la modification de la carte."
    });
  }
};

export const deleteCard = async (req: AuthRequest, res: Response) => {
  const { userId } = req.user;
  const { cardId } = req.params;

  try {
    const [cardRows] = await db.execute<CardOwnerRow[]>(
      "select id, author_id from retro_cards where id = ?",
      [cardId]
    );

    if (!cardRows.length) {
      logger.error(`❌ Carte introuvable : ${cardId}`);
      return res.status(404).json({
        success: false,
        message: "Carte introuvable."
      });
    }

    if (cardRows[0].author_id !== userId) {
      logger.error(`❌ L'utilisateur ${userId} n'est pas l'auteur de la carte ${cardId}`);
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez supprimer que vos propres cartes."
      });
    }

    // Les votes n'ont pas de suppression en cascade en base : on les retire
    // explicitement avant de supprimer la carte (sinon contrainte de clé étrangère).
    await db.execute("delete from votes where card_id = ?", [cardId]);
    await db.execute("delete from retro_cards where id = ?", [cardId]);

    logger.info(`✅ Carte supprimée : ${cardId}`);

    return res.status(200).json({
      success: true,
      message: "Carte supprimée."
    });

  } catch (error) {
    logger.error(`❌ Erreur lors de la suppression de la carte : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de la carte."
    });
  }
};
