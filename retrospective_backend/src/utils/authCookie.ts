import type { CookieOptions, Request } from "express";

export const AUTH_COOKIE_NAME = "token";

// Durée de vie du cookie, alignée sur l'expiration par défaut du JWT
// (1 h, voir signAuthToken dans services/auth.service.ts).
export const AUTH_COOKIE_MAX_AGE_MS = 60 * 60 * 1000;

// httpOnly : le token n'est pas lisible en JavaScript (protection XSS).
// sameSite lax : le cookie n'est pas envoyé depuis un site tiers.
// secure en production : le cookie ne circule qu'en HTTPS.
// Pas de maxAge ici : res.clearCookie doit recevoir les mêmes options
// sans durée de vie pour bien supprimer le cookie.
export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

// Le token peut venir du cookie (navigateur) ou du header Authorization
// (tests Supertest, outils) : le cookie a la priorité.
export const readAuthToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken !== "") {
    return cookieToken;
  }

  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }

  return null;
};
