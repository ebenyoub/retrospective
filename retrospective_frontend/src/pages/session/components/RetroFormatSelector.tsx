import type { ChangeEvent } from "react";

interface FormatPreset {
  name: string;
  columns: string[];
}

const FORMAT_PRESETS: FormatPreset[] = [
  { name: "Start / Stop / Continue", columns: ["Start", "Stop", "Continue"] },
  { name: "Mad / Sad / Glad", columns: ["Mad", "Sad", "Glad"] },
  { name: "Keep / Drop / Try", columns: ["Keep", "Drop", "Try"] },
  { name: "Went well / To improve / Actions", columns: ["Went well", "To improve", "Actions"] },
];

const CUSTOM_OPTION_VALUE = "__custom__";

interface RetroFormatSelectorProps {
  formatName: string;
  isFacilitator: boolean;
  disabled?: boolean;
  onSelectPreset: (name: string, columns: string[]) => void;
  onOpenCustomModal: () => void;
}

// Le format n'est modifiable que par le facilitateur (vérifié aussi côté
// backend, voir PATCH /session/:id/format) : un participant ne voit qu'un
// libellé en lecture seule.
const RetroFormatSelector = ({
  formatName,
  isFacilitator,
  disabled,
  onSelectPreset,
  onOpenCustomModal,
}: RetroFormatSelectorProps) => {
  if (!isFacilitator) {
    return <span className="font-sans text-xs text-slate-200 font-medium">{formatName}</span>;
  }

  const matchesPreset = FORMAT_PRESETS.some((preset) => preset.name === formatName);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value === CUSTOM_OPTION_VALUE) {
      onOpenCustomModal();
      return;
    }

    const preset = FORMAT_PRESETS.find((item) => item.name === value);
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
      {FORMAT_PRESETS.map((preset) => (
        <option key={preset.name} value={preset.name}>
          {preset.name}
        </option>
      ))}
      {!matchesPreset && <option value={formatName}>{formatName} (personnalisé)</option>}
      <option value={CUSTOM_OPTION_VALUE}>Créer un format personnalisé…</option>
    </select>
  );
};

export default RetroFormatSelector;
