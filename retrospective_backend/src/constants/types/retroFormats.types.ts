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
