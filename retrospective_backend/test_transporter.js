import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const email = "ismailbenyoub666@gmail.com";
const code = 4567;
const username = "Ismousy";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
});

async function run() {
    try {
        await transporter.verify();
        logger.info("✅ SMTP ready");
        const info = await transporter.sendMail({
            from: '"Range Ta Chambre" <no-reply@rangetachambre.com>', // Expéditeur personnalisé
            to: ["ebenyoub@me.com"],
            subject: "🔐 Réinitialisation",
            text: `Bonjour, voici votre code de réinitialisation : ${code}. Ce code est valable 10 minutes.`,
            html: `
                <h3 style={"color: red;"}>Réinitialisation de mot de passe</h3>
                <p>Bonjour <strong>${username}</strong>,</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p>Voici votre code de vérification : <h1>${code}</h1></p>
                <p>Ce code est valable <b>10 minutes</b>.</p>
                <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            `,
        });
        logger.info("✅ Mail envoyé", info.messageId);
    } catch (err) {
        logger.error("❌ Erreur SMTP :", err && err.message ? err.message : err);
        handleError(err);
    }
}

function handleError(err) {
    const msg = (err && err.message) ? err.message : String(err);

    // Erreurs fréquentes et solutions rapides
    if (msg.includes("Invalid login") || msg.includes("535") || msg.includes("EAUTH")) {
        logger.error("→ Erreur d'authentification. Vérifie :");
        logger.error("  • ton email (GMAIL_USER)");
        logger.error("  • le mot de passe d'application (GMAIL_APP_PASSWORD)");
        logger.error("  • que la validation 2 étapes est activée");
        logger.error("  • que tu n'as pas mis le mot de passe avec des espaces");
        return;
    }

    if (msg.includes("Missing credentials")) {
        logger.error("→ Credentials manquants : vérifie que les variables d'environnement sont bien chargées.");
        return;
    }

    if (msg.includes("ETIMEDOUT") || msg.includes("ECONNECTION") || msg.includes("ENOTFOUND")) {
        logger.error("→ Problème réseau / connexion au serveur SMTP.");
        logger.error("  • Essaie port 587 / secure: false (STARTTLS).");
        logger.error("  • Vérifie ton pare-feu ou ta box.");
        return;
    }

    if (msg.includes("534") || msg.includes("5.7.14")) {
        logger.error("→ Google bloque pour raison de sécurité. Ouvre ton compte Google et regarde les alertes de sécurité, accepte la connexion.");
        return;
    }

    logger.error("→ Erreur non identifiée. Colle le message d'erreur complet ici pour que je t'aide.");
}

run();
