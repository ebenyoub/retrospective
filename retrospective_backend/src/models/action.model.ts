import { ResultSetHeader } from "mysql2";
import db from "./db";
import type { ActionRow } from "./types/action.model.types";

export const findActionsBySessionId = async (sessionId: number): Promise<ActionRow[]> => {
  const [rows] = await db.execute<ActionRow[]>(
    "select id, session_id, description, owner, deadline, priority, created_at from session_actions where session_id = ? order by created_at asc",
    [sessionId]
  );
  return rows;
};

export const insertAction = async (
  sessionId: number,
  description: string,
  owner: string,
  priority: "high" | "medium" | "low",
  deadline: string | null
): Promise<{ insertId: number; affectedRows: number }> => {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into session_actions (session_id, description, owner, priority, deadline) values (?, ?, ?, ?, ?)",
    [sessionId, description, owner, priority, deadline || null]
  );

  return {
    insertId: result.insertId,
    affectedRows: result.affectedRows,
  };
};
