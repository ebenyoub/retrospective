import { z } from "zod";

export const createSessionSchema = z.object({
  body: z.object({
    name: z.string({ error: "Le nom de session est obligatoire." }).trim().min(3, "Le nom doit faire au moins 3 caractères."),
    formatName: z.string({ error: "Le nom du format est requis." }).trim()
      .min(1, "Le nom du format est requis.")
      .max(60, "Le nom du format ne peut pas dépasser 60 caractères.")
      .optional(),
    formatColumns: z.array(
      z.string().trim().min(1, "Le nom de la colonne est requis.").max(30, "Le nom de la colonne ne peut pas dépasser 30 caractères.")
    ).length(3, "Le format doit contenir exactement 3 colonnes.").optional(),
    stepDurationMinutes: z.number({ error: "La durée des étapes doit être un nombre." })
      .int("La durée des étapes doit être un nombre entier de minutes.")
      .min(1, "La durée des étapes doit être d'au moins 1 minute.")
      .max(120, "La durée des étapes ne peut pas dépasser 120 minutes.")
      .optional()
  })
});

export const updateSessionTimerSchema = z.object({
  body: z.object({
    minutes: z.number({ error: "La durée est requise." })
      .int("La durée doit être un nombre entier de minutes.")
      .min(1, "La durée doit être d'au moins 1 minute.")
      .max(120, "La durée ne peut pas dépasser 120 minutes.")
  })
});

export const joinSessionSchema = z.object({
  body: z.object({
    code: z.string({ error: "Le code de session est requis." }).trim().min(1, "Le code de session est requis.")
  })
});

export const createCardSchema = z.object({
  body: z.object({
    content: z.string({ error: "Le contenu de la carte est obligatoire." }).trim()
      .min(1, "Le contenu de la carte ne peut pas être vide.")
      .max(280, "La carte ne peut pas dépasser 280 caractères."),
    columnType: z.enum(["start", "stop", "continue"], {
      error: "Le type de colonne doit être 'start', 'stop' ou 'continue'."
    })
  })
});

export const updateCardSchema = z.object({
  body: z.object({
    content: z.string({ error: "Le contenu de la carte est obligatoire." }).trim()
      .min(1, "Le contenu de la carte ne peut pas être vide.")
      .max(280, "La carte ne peut pas dépasser 280 caractères.")
  })
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string({ error: "Le commentaire est obligatoire." }).trim()
      .min(1, "Le commentaire ne peut pas être vide.")
      .max(280, "Le commentaire ne peut pas dépasser 280 caractères.")
  })
});

export const createMessageSchema = z.object({
  body: z.object({
    content: z.string({ error: "Le message est obligatoire." }).trim()
      .min(1, "Le message ne peut pas être vide.")
      .max(500, "Le message ne peut pas dépasser 500 caractères.")
  })
});


export const updateSessionStepSchema = z.object({
  body: z.object({
    step: z.enum(["waiting", "writing", "voting", "results"], {
      error: "L'étape de session doit être 'waiting', 'writing', 'voting' ou 'results'."
    })
  })
});

export const updateSessionFormatSchema = z.object({
  body: z.object({
    formatName: z.string({ error: "Le nom du format est requis." }).trim()
      .min(1, "Le nom du format est requis.")
      .max(60, "Le nom du format ne peut pas dépasser 60 caractères."),
    formatColumns: z.array(
      z.string().trim().min(1, "Le nom de la colonne est requis.").max(30, "Le nom de la colonne ne peut pas dépasser 30 caractères.")
    ).length(3, "Le format doit contenir exactement 3 colonnes.")
  })
});
