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
  created_at: Date;
  expires_at: Date;
}


export interface AuthRequest extends Request {
  user?: any;
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
