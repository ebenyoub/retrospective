import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { RETRO_FORMAT_OPTIONS, getRetroFormatById } from "@/lib/retroFormats";
import type { RetroFormatDropdownProps } from "./types/RetroFormatDropdown.types";

// Menu déroulant accessible (pattern WAI-ARIA "listbox"), même comportement
// d'ouverture/fermeture/clavier que ProfileMenu, adapté à une liste de
// sélection de valeur (formatId) plutôt qu'à un menu d'actions.
const RetroFormatDropdown = ({
  id,
  value,
  onChange,
  disabled = false,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: RetroFormatDropdownProps) => {
  const selectedIndex = RETRO_FORMAT_OPTIONS.findIndex((format) => format.id === value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex === -1 ? 0 : selectedIndex);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const openMenu = () => {
    setIsOpen(true);
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
  };

  const selectItem = (index: number) => {
    onChange(RETRO_FORMAT_OPTIONS[index].id);
    close();
  };

  useEffect(() => {
    if (isOpen) itemRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % RETRO_FORMAT_OPTIONS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + RETRO_FORMAT_OPTIONS.length) % RETRO_FORMAT_OPTIONS.length);
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  const selectedFormat = getRetroFormatById(value);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? close() : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-blue-400 disabled:opacity-60"
      >
        <span className="truncate">{selectedFormat.name}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label="Format de rétro"
          onKeyDown={handleMenuKeyDown}
          className="absolute left-0 right-0 mt-2 rounded-[10px] border border-navy-border bg-navy-mid shadow-[0_8px_32px_rgba(0,0,0,0.35)] py-1.5 z-50"
        >
          {RETRO_FORMAT_OPTIONS.map((format, index) => {
            const isSelected = format.id === value;
            return (
              <button
                key={format.id}
                ref={(el) => { itemRefs.current[index] = el; }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className="w-full flex items-center justify-between gap-2 text-left px-3.5 py-2 text-xs font-sans cursor-pointer transition-colors text-slate-200 focus-visible:outline-none focus-visible:bg-white/10 hover:bg-white/10"
              >
                <span className="truncate">{format.name}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RetroFormatDropdown;
