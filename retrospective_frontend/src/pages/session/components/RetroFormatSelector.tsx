import { RETRO_FORMAT_OPTIONS } from "@/lib/retroFormats";
import RetroFormatDropdown from "@/components/RetroFormatDropdown";
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

  const selectedPreset = RETRO_FORMAT_OPTIONS.find((preset) => preset.name === formatName) || RETRO_FORMAT_OPTIONS[0];

  const handleChange = (formatId: string) => {
    const preset = RETRO_FORMAT_OPTIONS.find((item) => item.id === formatId);
    if (preset) {
      onSelectPreset(preset.name, preset.columns);
    }
  };

  return (
    <div className="w-52">
      <RetroFormatDropdown
        id="retro-format-lobby"
        value={selectedPreset.id}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Format de la rétrospective"
      />
    </div>
  );
};

export default RetroFormatSelector;
