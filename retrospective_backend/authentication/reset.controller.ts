import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import db from '../db'; // Ton fichier de config DB
import { logger } from '../utils/logger';


export const resetPassword = async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        logger.error("❌ Email, code de réinitialisation et mot de passe requis.")
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont requis."
        });
    }

    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM password WHERE email = ? AND expire_at > NOW()',
            [email]
        );

        if (!rows.length) {
            logger.error("❌ Le délai a expiré ou le code est invalide.");
            return res.status(400).json({
                success: false,
                message: "Le délai a expiré ou le code est invalide. Recommencez."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.execute(
            'UPDATE users SET hash_password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        await db.execute(
            'DELETE FROM password WHERE email = ?',
            [email]
        );

        logger.info(`✅ Mot de passe modifié pour ${email}`);

        return res.status(200).json({
            success: true,
            message: "Votre mot de passe a été modifié avec succès."
        });

    } catch (error) {
        logger.error("❌ [resetPassword] Erreur SQL:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la mise à jour."
        });
    }
}