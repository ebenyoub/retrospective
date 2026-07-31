export type RetroFormatId =
  | "start-stop-continue"
  | "positive-negative-actions"
  | "success-difficulties-ideas"
  | "liked-less-liked-proposals"
  | "keep-improve-innovate"
  | "went-well-improve-next-actions"
  | "custom-3-columns";

export interface RetroFormatOption {
  id: string; // Utiliser string pour être extensible
  name: string;
  columns: string[];
}
