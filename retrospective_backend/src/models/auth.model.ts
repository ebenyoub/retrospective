import { ResultSetHeader } from "mysql2/promise";
import db from "./db";
import type { AuthUserRow } from "./types/auth.model.types";

export const findUserByEmail = async (email: string): Promise<AuthUserRow | null> => {
  const [users] = await db.execute<AuthUserRow[]>(
    'SELECT id, username, hash_password, email FROM users WHERE email = ?',
    [email]
  );

  return users[0] ?? null;
};

export const findUsersByUsernameOrEmail = async (
  username: string,
  email: string
): Promise<AuthUserRow[]> => {
  const [users] = await db.execute<AuthUserRow[]>(
    'SELECT id, username, hash_password, email FROM users WHERE username = ? || email = ?',
    [username, email]
  );

  return users;
};

export const insertUser = async (
  username: string,
  email: string,
  hashedPassword: string
): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO users (username, email, hash_password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );

  return result.insertId;
};

export const deleteUserById = async (userId: number): Promise<void> => {
  await db.execute<ResultSetHeader>(
    'delete from users where id = ?',
    [userId]
  );
};
