import { RowDataPacket } from "mysql2/promise";
import db from "./db";

export interface PasswordResetUserRow extends RowDataPacket {
  id: number;
  username: string;
  hash_password: string;
  email?: string;
}

export interface PasswordTokenRow extends RowDataPacket {
  token: string;
}

export const findUserByEmail = async (email: string): Promise<PasswordResetUserRow | null> => {
  const [users] = await db.execute<PasswordResetUserRow[]>(
    'SELECT id, username, hash_password, email FROM users WHERE email = ?',
    [email]
  );

  return users[0] ?? null;
};

export const deletePasswordTokenByEmail = async (email: string): Promise<void> => {
  await db.execute(
    'delete from password where email = ?',
    [email]
  );
};

export const insertPasswordToken = async (
  token: string,
  email: string,
  expireAt: Date
): Promise<void> => {
  await db.execute(
    'insert into password (id, token, email, expire_at) values (?, ?, ?, ?)',
    [null, token, email, expireAt]
  );
};

export const findActivePasswordTokenByEmail = async (email: string): Promise<PasswordTokenRow | null> => {
  const [rows] = await db.execute<PasswordTokenRow[]>(
    'SELECT token FROM password WHERE email = ? AND expire_at > NOW()',
    [email]
  );

  return rows[0] ?? null;
};

export const findActivePasswordResetByEmail = async (email: string): Promise<RowDataPacket | null> => {
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id FROM password WHERE email = ? AND expire_at > NOW()',
    [email]
  );

  return rows[0] ?? null;
};

export const updateUserPasswordByEmail = async (
  email: string,
  hashedPassword: string
): Promise<void> => {
  await db.execute(
    'UPDATE users SET hash_password = ? WHERE email = ?',
    [hashedPassword, email]
  );
};
