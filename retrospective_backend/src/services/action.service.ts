import { AppError } from "../utils/AppError";
import { findSessionById } from "../models/session.model";
import { assertSessionOpen } from "./session.service";
import { findActionsBySessionId, insertAction } from "../models/action.model";
import type { CreateActionInput, ActionDetails } from "./types/action.service.types";
import type { ActionRow } from "../models/types/action.model.types";

const mapRowToDetails = (row: ActionRow): ActionDetails => ({
  id: row.id,
  sessionId: row.session_id,
  description: row.description,
  owner: row.owner,
  deadline: row.deadline ? new Date(row.deadline).toISOString().split("T")[0] : null,
  priority: row.priority,
  createdAt: new Date(row.created_at).toISOString(),
});

export const getActions = async (sessionId: number): Promise<ActionDetails[]> => {
  const session = await findSessionById(sessionId);
  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  const rows = await findActionsBySessionId(sessionId);
  return rows.map(mapRowToDetails);
};

export const addAction = async (
  sessionId: number,
  userId: number,
  input: CreateActionInput
): Promise<ActionDetails> => {
  const session = await findSessionById(sessionId);
  if (!session) {
    throw new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND");
  }

  if (session.owner_id !== userId) {
    throw new AppError(403, "Seul le facilitateur peut ajouter des actions à la session.", "FORBIDDEN");
  }

  assertSessionOpen(session);

  // Insertion SQL
  const { affectedRows, insertId } = await insertAction(
    sessionId,
    input.description,
    input.owner,
    input.priority,
    input.deadline || null
  );

  if (affectedRows === 0) {
    throw new AppError(500, "Impossible d'enregistrer l'action en base de données.", "DATABASE_ERROR");
  }

  return {
    id: insertId,
    sessionId,
    description: input.description,
    owner: input.owner,
    deadline: input.deadline || null,
    priority: input.priority,
    createdAt: new Date().toISOString(),
  };
};
