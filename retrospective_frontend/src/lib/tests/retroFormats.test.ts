import { describe, expect, it } from "vitest";
import { DEFAULT_RETRO_FORMAT_ID, RETRO_FORMAT_OPTIONS, getRetroFormatById } from "../retroFormats";

describe("retroFormats", () => {
  it("expose les 7 formats de rétro avec des identifiants techniques stables", () => {
    expect(RETRO_FORMAT_OPTIONS.map((format) => format.id)).toEqual([
      "start-stop-continue",
      "positive-negative-actions",
      "success-difficulties-ideas",
      "liked-less-liked-proposals",
      "keep-improve-innovate",
      "went-well-improve-next-actions",
      "custom-3-columns",
    ]);
    expect(RETRO_FORMAT_OPTIONS.map((format) => format.name)).toEqual([
      "Commencer / Arrêter / Continuer",
      "Points positifs / Points négatifs / Actions",
      "Succès / Difficultés / Idées",
      "J'ai aimé / J'ai moins aimé / Propositions",
      "Conserver / Améliorer / Innover",
      "Bien passé / À améliorer / Prochaines actions",
      "Créer un format personnalisé (3 colonnes)",
    ]);
  });

  it("définit exactement 3 colonnes par format", () => {
    RETRO_FORMAT_OPTIONS.forEach((format) => {
      expect(format.columns).toHaveLength(3);
    });
  });

  it("retourne le format par défaut si l'identifiant est inconnu", () => {
    expect(getRetroFormatById("unknown").id).toBe(DEFAULT_RETRO_FORMAT_ID);
  });
});
