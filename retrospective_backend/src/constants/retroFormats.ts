import type { RetroColumnKey, RetroFormatPreset } from './types/retroFormats.types';

export const RETRO_COLUMN_KEYS: RetroColumnKey[] = ["start", "stop", "continue"];

export const DEFAULT_RETRO_FORMAT_PRESET: RetroFormatPreset = {
  id: "start-stop-continue",
  name: "Commencer / Arrêter / Continuer",
  columns: [
    { key: "start", label: "Commencer" },
    { key: "stop", label: "Arrêter" },
    { key: "continue", label: "Continuer" },
  ],
};

export const RETRO_FORMAT_PRESETS: RetroFormatPreset[] = [
  DEFAULT_RETRO_FORMAT_PRESET,
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

export const getRetroFormatColumnLabels = (format: RetroFormatPreset): string[] =>
  format.columns.map((column) => column.label);

export const findRetroFormatByName = (formatName: string): RetroFormatPreset | null =>
  RETRO_FORMAT_PRESETS.find((format) => format.name === formatName) ?? null;

export const isValidRetroFormatSelection = (formatName: string, formatColumns: string[]): boolean => {
  const format = findRetroFormatByName(formatName);

  if (!format) return false;

  const expectedColumns = getRetroFormatColumnLabels(format);

  return expectedColumns.length === formatColumns.length
    && expectedColumns.every((column, index) => column === formatColumns[index]);
};
