import type { RetroFormatId, RetroFormatOption } from './types/retroFormats.types';

export const RETRO_FORMAT_OPTIONS: RetroFormatOption[] = [
  {
    id: "start-stop-continue",
    name: "Commencer / Arrêter / Continuer",
    columns: ["Commencer", "Arrêter", "Continuer"],
  },
  {
    id: "positive-negative-actions",
    name: "Points positifs / Points négatifs / Actions",
    columns: ["Points positifs", "Points négatifs", "Actions"],
  },
  {
    id: "success-difficulties-ideas",
    name: "Succès / Difficultés / Idées",
    columns: ["Succès", "Difficultés", "Idées"],
  },
  {
    id: "liked-less-liked-proposals",
    name: "J'ai aimé / J'ai moins aimé / Propositions",
    columns: ["J'ai aimé", "J'ai moins aimé", "Propositions"],
  },
  {
    id: "keep-improve-innovate",
    name: "Conserver / Améliorer / Innover",
    columns: ["Conserver", "Améliorer", "Innover"],
  },
  {
    id: "went-well-improve-next-actions",
    name: "Bien passé / À améliorer / Prochaines actions",
    columns: ["Bien passé", "À améliorer", "Prochaines actions"],
  },
  {
    id: "custom-3-columns",
    name: "Créer un format personnalisé (3 colonnes)",
    columns: ["Colonne 1", "Colonne 2", "Colonne 3"],
  },
];

export const DEFAULT_RETRO_FORMAT_ID = "start-stop-continue";

export const getRetroFormatById = (formatId: string): RetroFormatOption =>
  RETRO_FORMAT_OPTIONS.find((format) => format.id === formatId) ?? RETRO_FORMAT_OPTIONS[0];
