import { describe, expect, it } from "vitest";
import { DEFAULT_API_ERROR_MESSAGE, getApiErrorMessage, isApiSuccess } from "./apiError";

describe("apiError", () => {
  it("retourne le message API quand il est exploitable", () => {
    expect(getApiErrorMessage({ message: "Code invalide." })).toBe("Code invalide.");
  });

  it("retourne le fallback si le message API est absent ou vide", () => {
    expect(getApiErrorMessage({ success: false }, "Fallback")).toBe("Fallback");
    expect(getApiErrorMessage({ message: "   " }, "Fallback")).toBe("Fallback");
  });

  it("utilise le message par défaut sans fallback explicite", () => {
    expect(getApiErrorMessage(null)).toBe(DEFAULT_API_ERROR_MESSAGE);
  });

  it("identifie une réponse API success", () => {
    expect(isApiSuccess({ success: true, data: [] })).toBe(true);
    expect(isApiSuccess({ success: false, data: [] })).toBe(false);
  });
});
