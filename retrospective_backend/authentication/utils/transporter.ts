import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT ?? "587");

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp-relay.brevo.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS ?? process.env.EMAIL_PROVIDER_API_KEY,
  },
});
