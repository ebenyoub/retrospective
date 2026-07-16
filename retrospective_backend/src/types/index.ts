import { RowDataPacket } from "mysql2/promise";
import { Request } from 'express';

export interface SessionType {
  id: number;
  name: string;
  code: string;
  owner_id: number;
  status: string;
  step: "waiting" | "writing" | "voting" | "results";
  format_name: string;
  format_columns: string[];
  step_duration_minutes: number;
  step_ends_at: Date | null;
  created_at: Date;
  expires_at: Date;
}


// Identité extraite du JWT et attachée à la requête par le middleware `auth`.
export interface AuthUser {
  userId: number;
  username: string;
}

// Requête d'une route protégée : le middleware `auth` a validé le token et
// rempli `user`. `user` reste optionnel côté type (Express fournit une
// `Request` de base sans `user`) ; le helper `requireAuthUser` garantit sa
// présence à l'exécution. Les routes publiques utilisent `Request` directement.
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  hash_password: string;
}

export interface SessionLookupRow extends RowDataPacket {
  id: number;
}

export interface JoinRow extends RowDataPacket {
  id: number;
  user_id: number;
  session_id: number;
}
