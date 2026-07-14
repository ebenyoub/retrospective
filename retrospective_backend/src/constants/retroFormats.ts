export type RetroColumnKey = "start" | "stop" | "continue";

export interface RetroFormatColumn {
  key: RetroColumnKey;
  label: string;
}

export interface RetroFormatPreset {
  id: string;
  name: string;
  columns: RetroFormatColumn[];
}

export const RETRO_COLUMN_KEYS: RetroColumnKey[] = ["start", "stop", "continue"];

export const RETRO_FORMAT_PRESETS: RetroFormatPreset[] = [
  {
    id: "start-stop-continue",
    name: "Commencer / Arrêter / Continuer",
    columns: [
      { key: "start", label: "Commencer" },
      { key: "stop", label: "Arrêter" },
      { key: "continue", label: "Continuer" },
    ],
  },
  {
    id: "positive-negative-actions",
    name: "Points positifs / Points négatifs / Actions",
    columns: [
      { key: "start", label: "Points positifs" },
      { key: "stop", label: "Points négatifs" },
      { key: "continue", label: "Actions" },
    ],
  },
  {
    id: "success-difficulties-ideas",
    name: "Succès / Difficultés / Idées",
    columns: [
      { key: "start", label: "Succès" },
      { key: "stop", label: "Difficultés" },
      { key: "continue", label: "Idées" },
    ],
  },
  {
    id: "liked-less-liked-proposals",
    name: "J'ai aimé / J'ai moins aimé / Propositions",
    columns: [
      { key: "start", label: "J'ai aimé" },
      { key: "stop", label: "J'ai moins aimé" },
      { key: "continue", label: "Propositions" },
    ],
  },
  {
    id: "keep-improve-innovate",
    name: "Conserver / Améliorer / Innover",
    columns: [
      { key: "start", label: "Conserver" },
      { key: "stop", label: "Améliorer" },
      { key: "continue", label: "Innover" },
    ],
  },
  {
    id: "went-well-improve-next-actions",
    name: "Bien passé / À améliorer / Prochaines actions",
    columns: [
      { key: "start", label: "Bien passé" },
      { key: "stop", label: "À améliorer" },
      { key: "continue", label: "Prochaines actions" },
    ],
  },
];

