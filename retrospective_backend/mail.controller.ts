import nodemailer, { SentMessageInfo } from "nodemailer";
import { logger } from "./utils/logger";

// Créer un objet transporteur
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.me.com',
  port: 587,
  secure: false, // utiliser SSL
  auth: {
    user: 'ebenyoub@me.com',
    pass: process.env.MAIL_PASSWORD,
  }
});

// Configurer l'objet mailOptions
const mailOptions = {
  from: 'votre_nom_d_utilisateur@email.com',
  to: 'votreami@email.com',
  subject: 'Envoyer un email en utilisant Node.js',
  text: 'C\'était facile!'
};

// Envoyer l'email
transporter.sendMail(mailOptions, function(error:Error | null, info: SentMessageInfo){
  if (error) {
    logger.error('Erreur:', error);
  } else {
    logger.info('Email envoyé:', info.response);
  }
});