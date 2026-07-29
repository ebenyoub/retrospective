import { ResultSetHeader } from "mysql2";
import db from "./db";
import type { CommentOwnerRow, CommentRow } from "./types/comment.model.types";

const COMMENT_COLUMNS = "cc.id, cc.card_id, cc.author_participant_id, sp.display_name as author_name, cc.content, cc.created_at";

export const insertComment = async (
  cardId: number,
  participantId: number,
  content: string
): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into card_comments (card_id, author_participant_id, content) values (?, ?, ?)",
    [cardId, participantId, content]
  );

  return result.insertId;
};

export const findCommentsByCardId = async (cardId: number): Promise<CommentRow[]> => {
  const [comments] = await db.execute<CommentRow[]>(
    `select ${COMMENT_COLUMNS}
     from card_comments cc
     inner join session_participants sp on sp.id = cc.author_participant_id
     where cc.card_id = ?
     order by cc.created_at asc`,
    [cardId]
  );

  return comments;
};

export const findCommentById = async (commentId: number): Promise<CommentRow | null> => {
  const [rows] = await db.execute<CommentRow[]>(
    `select ${COMMENT_COLUMNS}
     from card_comments cc
     inner join session_participants sp on sp.id = cc.author_participant_id
     where cc.id = ?`,
    [commentId]
  );

  return rows[0] ?? null;
};

export const findCommentOwner = async (commentId: number): Promise<CommentOwnerRow | null> => {
  const [rows] = await db.execute<CommentOwnerRow[]>(
    "select id, card_id, author_participant_id from card_comments where id = ?",
    [commentId]
  );

  return rows[0] ?? null;
};

export const deleteCommentById = async (commentId: number): Promise<void> => {
  await db.execute("delete from card_comments where id = ?", [commentId]);
};
