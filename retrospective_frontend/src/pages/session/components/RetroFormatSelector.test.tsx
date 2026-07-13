import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RetroFormatSelector from './RetroFormatSelector';

describe('RetroFormatSelector', () => {
  it('participant : affiche un simple libellé en lecture seule (pas de select)', () => {
    render(
      <RetroFormatSelector
        formatName="Mad / Sad / Glad"
        isFacilitator={false}
        onSelectPreset={vi.fn()}
        onOpenCustomModal={vi.fn()}
      />
    );

    expect(screen.getByText('Mad / Sad / Glad')).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('facilitateur : affiche un sélecteur avec les presets et l\'option personnalisée', () => {
    render(
      <RetroFormatSelector
        formatName="Start / Stop / Continue"
        isFacilitator
        onSelectPreset={vi.fn()}
        onOpenCustomModal={vi.fn()}
      />
    );

    const select = screen.getByLabelText('Format de la rétrospective') as HTMLSelectElement;
    expect(select.value).toBe('Start / Stop / Continue');
    expect(screen.getByText('Mad / Sad / Glad')).toBeTruthy();
    expect(screen.getByText('Créer un format personnalisé…')).toBeTruthy();
  });

  it('sélectionner un preset appelle onSelectPreset avec ses colonnes', () => {
    const onSelectPreset = vi.fn();
    render(
      <RetroFormatSelector
        formatName="Start / Stop / Continue"
        isFacilitator
        onSelectPreset={onSelectPreset}
        onOpenCustomModal={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Format de la rétrospective'), { target: { value: 'Mad / Sad / Glad' } });

    expect(onSelectPreset).toHaveBeenCalledWith('Mad / Sad / Glad', ['Mad', 'Sad', 'Glad']);
  });

  it('sélectionner "Créer un format personnalisé" ouvre la modale sans changer le format actuel', () => {
    const onOpenCustomModal = vi.fn();
    const onSelectPreset = vi.fn();
    render(
      <RetroFormatSelector
        formatName="Start / Stop / Continue"
        isFacilitator
        onSelectPreset={onSelectPreset}
        onOpenCustomModal={onOpenCustomModal}
      />
    );

    fireEvent.change(screen.getByLabelText('Format de la rétrospective'), { target: { value: '__custom__' } });

    expect(onOpenCustomModal).toHaveBeenCalled();
    expect(onSelectPreset).not.toHaveBeenCalled();
  });
});
