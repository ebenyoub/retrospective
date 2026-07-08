import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import {
  deleteUserById,
  findUserByUsername,
  findUsersByUsernameOrEmail,
  insertUser,
} from "../models/auth.model";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

interface LoginInput {
  username: unknown;
  password: unknown;
}

interface SignupInput {
  username: unknown;
  email: unknown;
  password: unknown;
}

interface DeleteAccountInput {
  userId?: number;
  username?: string;
}

interface ProfileInput {
  userId: number;
  username: string;
}

interface AuthResult {
  token: string;
  userId: number;
  username: string;
  email?: string;
}

const signAuthToken = (userId: number, username: string): string => {
  const jwtSecret = process.env.JWT_SECRET as string;
  const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];
  const signOptions: jwt.SignOptions = { expiresIn: jwtExpiresIn };

  return jwt.sign({ userId, username }, jwtSecret, signOptions);
};

export const loginUser = async ({ username, password }: LoginInput): Promise<AuthResult> => {
  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    throw new AppError(400, "Le pseudo et le mot de passe sont requis.");
  }

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      logger.error('❌ [signup] Utilisateur non trouvé.');
      throw new AppError(401, "Pseudo inconnu.");
    }

    const passwordMatch = await bcrypt.compare(password.trim(), user.hash_password);

    if (!passwordMatch) {
      logger.error("❌ Le mot de passe ne correspond pas au hash de la BDD.");
      throw new AppError(401, "Identifiants invalides.");
    }

    const token = signAuthToken(user.id, username);

    logger.info(`✅ Connexion réussie, bienvenue ${username}`);

    return {
      token,
      userId: user.id,
      username,
      email: user.email,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error('❌ Erreur SQL lors de la connexion/création:', error);
    throw new AppError(500, "Erreur interne du serveur. Le pseudo est peut-être déjà pris.");
  }
};

export const signupUser = async ({ username, email, password }: SignupInput): Promise<AuthResult> => {
  if (!username || !password || !email || typeof username !== "string" || typeof password !== "string" || typeof email !== "string") {
    throw new AppError(400, "Des champs sont requis.");
  }

  try {
    await findUsersByUsernameOrEmail(username, email);

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
    logger.error('❌ Erreur SQL lors de la connexion/création:', error);
    throw new AppError(500, "Erreur interne du serveur. Le pseudo est peut-être déjà pris.");
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
