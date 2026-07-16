import type { ChangeEvent } from "react";
import { RETRO_FORMAT_OPTIONS } from "@/lib/retroFormats";
import type { RetroFormatSelectorProps } from './types/RetroFormatSelector.types';

// Le format n'est modifiable que par le facilitateur (vérifié aussi côté
// backend, voir PATCH /session/:id/format) : un participant ne voit qu'un
// libellé en lecture seule.
const RetroFormatSelector = ({
  formatName,
  isFacilitator,
  disabled,
  onSelectPreset,
}: RetroFormatSelectorProps) => {
  if (!isFacilitator) {
    return <span className="font-sans text-xs text-slate-200 font-medium">{formatName}</span>;
  }

  const matchesPreset = RETRO_FORMAT_OPTIONS.some((preset) => preset.name === formatName);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const preset = RETRO_FORMAT_OPTIONS.find((item) => item.name === value);
    if (preset) {
      onSelectPreset(preset.name, preset.columns);
    }
  };

  return (
    <select
      aria-label="Format de la rétrospective"
      value={formatName}
      onChange={handleChange}
      disabled={disabled}
      className="font-sans text-xs text-slate-200 font-medium bg-navy-surface border border-navy-border-med rounded-[6px] px-2 py-1 cursor-pointer focus:outline-none focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {!matchesPreset && <option value={formatName}>{formatName}</option>}
      {RETRO_FORMAT_OPTIONS.map((preset) => (
        <option key={preset.name} value={preset.name}>
          {preset.name}
        </option>
      ))}
    </select>
  );
};

export default RetroFormatSelector;
