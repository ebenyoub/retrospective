export interface RetroFormatDropdownProps {
  id: string;
  value: string; // formatId actuel
  onChange: (formatId: string) => void;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}
