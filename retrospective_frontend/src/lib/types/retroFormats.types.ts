export type RetroFormatId =
  | "start-stop-continue"
  | "positive-negative-actions"
  | "success-difficulties-ideas"
  | "liked-less-liked-proposals"
  | "keep-improve-innovate"
  | "went-well-improve-next-actions";

export interface RetroFormatOption {
  id: RetroFormatId;
  name: string;
  columns: string[];
}
