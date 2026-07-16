export interface RetroFormatSelectorProps {
  formatName: string;
  isFacilitator: boolean;
  disabled?: boolean;
  onSelectPreset: (name: string, columns: string[]) => void;
}
