import { ResultSetHeader } from "mysql2/promise";
import db from "./db";
import type { PasswordResetUserRow, PasswordTokenRow } from "./types/passwordReset.model.types";

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

export const deletePasswordTokenByIdAndEmail = async (id: number, email: string): Promise<void> => {
  await db.execute(
    'DELETE FROM password WHERE id = ? AND email = ?',
    [id, email]
  );
};

export const deleteExpiredPasswordTokens = async (): Promise<void> => {
  await db.execute('DELETE FROM password WHERE expire_at <= NOW()');
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
    'SELECT id, token FROM password WHERE email = ? AND expire_at > NOW()',
    [email]
  );

  return rows[0] ?? null;
};

export const findActivePasswordTokenByIdAndEmail = async (
  id: number,
  email: string
): Promise<PasswordTokenRow | null> => {
  const [rows] = await db.execute<PasswordTokenRow[]>(
    'SELECT id, token FROM password WHERE id = ? AND email = ? AND expire_at > NOW()',
    [id, email]
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

// Le verrou de ligne sérialise les requêtes qui présentent le même tempToken :
// une seule transaction peut mettre à jour le mot de passe puis supprimer la
// demande. Les autres ne trouvent plus de demande active après avoir attendu
// le verrou.
export const consumePasswordResetAndUpdateUserPassword = async (
  passwordResetId: number,
  email: string,
  hashedPassword: string
): Promise<boolean> => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [tokenRows] = await connection.execute<PasswordTokenRow[]>(
      "SELECT id FROM password WHERE id = ? AND email = ? AND expire_at > NOW() FOR UPDATE",
      [passwordResetId, email]
    );
    if (!tokenRows[0]) {
      await connection.rollback();
      return false;
    }

    const [passwordUpdate] = await connection.execute<ResultSetHeader>(
      "UPDATE users SET hash_password = ? WHERE email = ?",
      [hashedPassword, email]
    );
    if (passwordUpdate.affectedRows !== 1) {
      await connection.rollback();
      return false;
    }

    const [tokenDeletion] = await connection.execute<ResultSetHeader>(
      "DELETE FROM password WHERE id = ? AND email = ?",
      [passwordResetId, email]
    );
    if (tokenDeletion.affectedRows !== 1) {
      await connection.rollback();
      return false;
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
