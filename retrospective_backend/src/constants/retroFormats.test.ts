import { describe, expect, it } from "vitest";
import {
  DEFAULT_RETRO_FORMAT_PRESET,
  RETRO_COLUMN_KEYS,
  RETRO_FORMAT_PRESETS,
  getRetroFormatColumnLabels,
  isValidRetroFormatSelection,
} from "./retroFormats";

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

  it("valide uniquement les formats MVP avec leurs colonnes attendues", () => {
    expect(isValidRetroFormatSelection(
      DEFAULT_RETRO_FORMAT_PRESET.name,
      getRetroFormatColumnLabels(DEFAULT_RETRO_FORMAT_PRESET)
    )).toBe(true);
    expect(isValidRetroFormatSelection("Mad / Sad / Glad", ["Mad", "Sad", "Glad"])).toBe(false);
    expect(isValidRetroFormatSelection(DEFAULT_RETRO_FORMAT_PRESET.name, ["Start", "Stop", "Continue"])).toBe(false);
  });
});
