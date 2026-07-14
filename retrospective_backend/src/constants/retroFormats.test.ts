import { describe, expect, it } from "vitest";
import { RETRO_COLUMN_KEYS, RETRO_FORMAT_PRESETS } from "./retroFormats";

describe("retroFormats", () => {
  it("définit les 6 formats MVP validés", () => {
    expect(RETRO_FORMAT_PRESETS.map((format) => format.name)).toEqual([
      "Commencer / Arrêter / Continuer",
      "Points positifs / Points négatifs / Actions",
      "Succès / Difficultés / Idées",
      "J'ai aimé / J'ai moins aimé / Propositions",
      "Conserver / Améliorer / Innover",
      "Bien passé / À améliorer / Prochaines actions",
    ]);
  });

  it("associe exactement 3 colonnes aux clés techniques stables", () => {
    RETRO_FORMAT_PRESETS.forEach((format) => {
      expect(format.columns).toHaveLength(3);
      expect(format.columns.map((column) => column.key)).toEqual(RETRO_COLUMN_KEYS);
    });
  });
});

