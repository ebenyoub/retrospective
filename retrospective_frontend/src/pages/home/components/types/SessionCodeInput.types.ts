export interface SessionCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
}
