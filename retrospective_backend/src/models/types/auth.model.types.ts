import type { RowDataPacket } from "mysql2/promise";

export interface AuthUserRow extends RowDataPacket {
  id: number;
  username: string;
  hash_password: string;
  email: string;
}
