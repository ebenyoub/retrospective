import type { RowDataPacket } from "mysql2/promise";

export interface PasswordResetUserRow extends RowDataPacket {
  id: number;
  username: string;
  hash_password: string;
  email?: string;
}

export interface PasswordTokenRow extends RowDataPacket {
  id: number;
  token: string;
}
