import { z } from "zod";

export const createSessionSchema = z.object({
  body: z.object({
    name: z.string({ error: "Le nom de session est obligatoire." }).trim().min(3, "Le nom doit faire au moins 3 caractères.")
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

export const updateSessionStepSchema = z.object({
  body: z.object({
    step: z.enum(["waiting", "writing", "voting", "results"], {
      error: "L'étape de session doit être 'waiting', 'writing', 'voting' ou 'results'."
    })
  })
});

