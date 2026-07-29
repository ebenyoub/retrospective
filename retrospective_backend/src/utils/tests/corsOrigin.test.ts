import { describe, it, expect, afterEach } from "vitest";
import { isOriginAllowed } from "../corsOrigin";

describe("corsOrigin", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("autorise toujours l'absence d'origine (requêtes non-navigateur : curl, tests)", () => {
    expect(isOriginAllowed(undefined, "http://localhost:5173")).toBe(true);
  });

  it("autorise l'origine exacte configurée (FRONTEND_ORIGIN), même en production", () => {
    process.env.NODE_ENV = "production";
    expect(isOriginAllowed("http://localhost:5173", "http://localhost:5173")).toBe(true);
  });

  it("refuse une origine inconnue en production", () => {
    process.env.NODE_ENV = "production";
    expect(isOriginAllowed("http://192.168.50.93:5173", "http://localhost:5173")).toBe(false);
  });

  it("autorise une IP privée du réseau local sur un port Vite, hors production", () => {
    process.env.NODE_ENV = "development";
    expect(isOriginAllowed("http://192.168.50.93:5173", "http://localhost:5173")).toBe(true);
    expect(isOriginAllowed("http://10.0.0.42:5180", "http://localhost:5173")).toBe(true);
    expect(isOriginAllowed("http://172.20.5.6:5173", "http://localhost:5173")).toBe(true);
  });

  it("refuse une IP privée hors production sur un port qui n'est pas celui de Vite", () => {
    process.env.NODE_ENV = "development";
    expect(isOriginAllowed("http://192.168.50.93:8000", "http://localhost:5173")).toBe(false);
  });

  it("refuse une IP publique même hors production", () => {
    process.env.NODE_ENV = "development";
    expect(isOriginAllowed("http://8.8.8.8:5173", "http://localhost:5173")).toBe(false);
  });
});
