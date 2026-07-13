import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";

const CODE_LENGTH = 4;

interface SessionCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
}

// Saisie du code de session en 4 cases individuelles : clavier, retour
// arrière et collage du code complet sont pris en charge.
const SessionCodeInput = ({ value, onChange, disabled, hasError, describedBy }: SessionCodeInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? "");

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          aria-label={`Chiffre ${index + 1} du code`}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          maxLength={1}
          inputMode="numeric"
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={`w-[46px] h-[54px] text-center text-xl font-bold font-mono rounded-figma-md outline-none transition-colors border hover:border-white/25 focus:border-white/40 focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            hasError
              ? "border-red-500/70 bg-red-950/20"
              : digit
                ? "border-white/30 bg-white/[0.08]"
                : "border-navy-border-med bg-navy-surface"
          } text-slate-50`}
        />
      ))}
    </div>
  );
};

export default SessionCodeInput;
