import { useCallback, useState } from "react";

const STORAGE_KEY = "retro:soundEnabled";

// localStorage : préférence globale au navigateur, pas propre à une session
// (comme les jetons invités), donc pas de clé par sessionId ici.
const readStoredPreference = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
};

export const useSoundPreference = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(readStoredPreference);

  const toggleSound = useCallback((): void => {
    setIsSoundEnabled((previous) => {
      const next = !previous;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Stockage indisponible (navigation privée...) : la préférence reste
        // active pour la session en cours seulement.
      }
      return next;
    });
  }, []);

  return { isSoundEnabled, toggleSound };
};
