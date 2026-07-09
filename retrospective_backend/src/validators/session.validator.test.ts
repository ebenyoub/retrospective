import { describe, it, expect } from "vitest";
import { createSessionSchema, createCardSchema, updateSessionStepSchema } from "./session.validator";
import { signupSchema } from "./auth.validator";

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
});
