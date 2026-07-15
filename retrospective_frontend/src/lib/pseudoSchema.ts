import { z } from "zod";

// Même règle que côté backend (validators/participant.validator.ts) : lettres
// (accents inclus), chiffres, espaces, apostrophes et tirets.
export const PSEUDO_REGEX = /^[\p{L}\p{N} '’-]+$/u;

// Source de vérité unique du pseudo côté frontend : importée par
// JoinSessionForm (accueil) et JoinSessionModal (arrivée par lien direct)
// pour que les deux formulaires ne divergent plus du backend.
export const pseudoSchema = z
  .string({ error: "Le pseudo est requis." })
  .trim()
  .min(2, "Le pseudo doit contenir au moins 2 caractères.")
  .max(30, "Le pseudo ne peut pas dépasser 30 caractères.")
  .regex(PSEUDO_REGEX, "Le pseudo ne peut contenir que des lettres, chiffres, espaces, apostrophes et tirets.");
