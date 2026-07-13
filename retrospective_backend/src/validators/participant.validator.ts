import { z } from "zod";

// Lettres (accentuées incluses), chiffres, espaces, apostrophes et tirets.
const PSEUDO_REGEX = /^[\p{L}\p{N} '’-]+$/u;

export const pseudoSchema = z
  .string({ error: "Le pseudo est requis." })
  .trim()
  .min(2, "Le pseudo doit contenir au moins 2 caractères.")
  .max(30, "Le pseudo ne peut pas dépasser 30 caractères.")
  .regex(PSEUDO_REGEX, "Le pseudo ne peut contenir que des lettres, chiffres, espaces, apostrophes et tirets.");

export const guestJoinSchema = z.object({
  body: z.object({
    pseudo: pseudoSchema,
  }),
});

export const guestJoinByCodeSchema = z.object({
  body: z.object({
    code: z
      .string({ error: "Le code de session est requis." })
      .regex(/^\d{4}$/, "Le code de session doit contenir 4 chiffres."),
    pseudo: pseudoSchema,
  }),
});

export const resumeGuestSchema = z.object({
  body: z.object({
    participantId: z.number({ error: "L'identifiant de participant est requis." }).int().positive(),
    guestToken: z.string({ error: "Le jeton invité est requis." }).trim().min(1, "Le jeton invité est requis."),
  }),
});

export const leaveParticipantSchema = z.object({
  body: z.object({
    guestToken: z.string().trim().min(1).optional(),
  }),
});
