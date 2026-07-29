import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import {
  deleteUserById,
  findUserByEmail,
  findUsersByUsernameOrEmail,
  insertUser,
} from "../models/auth.model";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import type {
  AuthResult,
  DeleteAccountInput,
  LoginInput,
  ProfileInput,
  SignupInput,
} from "./types/auth.service.types";

export const signAuthToken = (userId: number, username: string): string => {
  const jwtSecret = process.env.JWT_SECRET as string;
  const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];
  const signOptions: jwt.SignOptions = { expiresIn: jwtExpiresIn };

  return jwt.sign({ userId, username }, jwtSecret, signOptions);
};

export const loginUser = async ({ email, password }: LoginInput): Promise<AuthResult> => {
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    throw new AppError(400, "L'email et le mot de passe sont requis.");
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      logger.error('❌ [login] Utilisateur non trouvé.');
      throw new AppError(401, "Email inconnu.");
    }

    const passwordMatch = await bcrypt.compare(password.trim(), user.hash_password);

    if (!passwordMatch) {
      logger.error("❌ Le mot de passe ne correspond pas au hash de la BDD.");
      throw new AppError(401, "Identifiants invalides.");
    }

    const token = signAuthToken(user.id, user.username);

    logger.info(`✅ Connexion réussie, bienvenue ${user.username}`);

    return {
      token,
      userId: user.id,
      username: user.username,
      email: user.email,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error('❌ Erreur SQL lors de la connexion:', error);
    throw new AppError(500, "Erreur interne du serveur.");
  }
};

export const signupUser = async ({ username, email, password }: SignupInput): Promise<AuthResult> => {
  if (!username || !password || !email || typeof username !== "string" || typeof password !== "string" || typeof email !== "string") {
    throw new AppError(400, "Des champs sont requis.");
  }

  const existingUsers = await findUsersByUsernameOrEmail(username, email);

  if (existingUsers.length > 0) {
    throw new AppError(409, "Ce pseudo ou cet email est déjà utilisé.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await insertUser(username, email, hashedPassword);

    logger.info("✅ Création de l'utilisateur dans la BDD", { userId });

    const token = signAuthToken(userId, username);

    logger.info(`✅ Connexion réussie, bienvenue ${username}`);

    return {
      token,
      userId,
      username,
    };
  } catch (error) {
    logger.error('❌ Erreur SQL lors de la création du compte:', error);
    throw new AppError(500, "Erreur interne du serveur.");
  }
};

export const deleteAccountForUser = async ({ userId, username }: DeleteAccountInput): Promise<string> => {
  if (!userId) {
    throw new AppError(400, "Le userId est introuvable dans le token.");
  }

  try {
    await deleteUserById(userId);

    logger.info("✅ Suppression de l'utilisateur dans la BDD");

    return `L'utilisateur ${username} a été supprimé`;
  } catch (error) {
    logger.error('❌ Erreur SQL lors de la suppression de l\'utilisateur: ', error);
    throw new AppError(400, "Erreur interne du serveur.");
  }
};

export const getProfile = ({ userId, username }: ProfileInput) => ({
  userId,
  username,
});
