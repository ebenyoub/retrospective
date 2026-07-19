import { describe, it, expect } from "vitest";
import { createSessionSchema, createCardSchema, updateSessionStepSchema, updateSessionFormatSchema } from "../session.validator";
import { signupSchema } from "../auth.validator";
import { guestJoinSchema } from "../participant.validator";

// Vérifie que les messages d'erreur personnalisés (syntaxe Zod v4 `error`)
// sont bien renvoyés à l'utilisateur.
describe("validators — messages d'erreur personnalisés", () => {
  it("renvoie le message si le nom de session est absent", () => {
    const result = createSessionSchema.safeParse({ body: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Le nom de session est obligatoire.");
    }
  });

  it("renvoie le message si le type de colonne est invalide", () => {
    const result = createCardSchema.safeParse({
      body: { content: "Une carte", columnType: "invalide" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Le type de colonne doit être 'start', 'stop' ou 'continue'."
      );
    }
  });

  it("renvoie le message si l'étape de session est invalide", () => {
    const result = updateSessionStepSchema.safeParse({ body: { step: "pause" } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "L'étape de session doit être 'waiting', 'writing', 'voting' ou 'results'."
      );
    }
  });

  it("renvoie le message si le mot de passe d'inscription est absent", () => {
    const result = signupSchema.safeParse({
      body: { username: "Elyas", email: "elyas@example.com" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Le mot de passe est requis.");
    }
  });

  it("renvoie le message si le format n'a pas exactement 3 colonnes", () => {
    const result = updateSessionFormatSchema.safeParse({
      body: { formatName: "Solo", formatColumns: ["Une seule"] },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Le format doit contenir exactement 3 colonnes.");
    }
  });

  it("accepte un format avec exactement 3 colonnes", () => {
    const result = updateSessionFormatSchema.safeParse({
      body: { formatName: "Succès / Difficultés / Idées", formatColumns: ["Succès", "Difficultés", "Idées"] },
    });
    expect(result.success).toBe(true);
  });

  it("renvoie le message si le pseudo invité est trop court", () => {
    const result = guestJoinSchema.safeParse({ body: { pseudo: "E" } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Le pseudo doit contenir au moins 2 caractères.");
    }
  });

  it("conserve le pseudo tel quel (trim uniquement, pas de transformation)", () => {
    const result = guestJoinSchema.safeParse({ body: { pseudo: "  EBNoob  " } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.pseudo).toBe("EBNoob");
    }
  });
});
