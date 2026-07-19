import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RetroFormatSelector from '../RetroFormatSelector';

describe('RetroFormatSelector', () => {
  it('participant : affiche un simple libellé en lecture seule (pas de select)', () => {
    render(
      <RetroFormatSelector
        formatName="Succès / Difficultés / Idées"
        isFacilitator={false}
        onSelectPreset={vi.fn()}
      />
    );

    expect(screen.getByText('Succès / Difficultés / Idées')).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('facilitateur : affiche uniquement les 6 formats MVP français', () => {
    render(
      <RetroFormatSelector
        formatName="Commencer / Arrêter / Continuer"
        isFacilitator
        onSelectPreset={vi.fn()}
      />
    );

    const select = screen.getByLabelText('Format de la rétrospective') as HTMLSelectElement;
    expect(select.value).toBe('Commencer / Arrêter / Continuer');
    expect(screen.getByText('Points positifs / Points négatifs / Actions')).toBeTruthy();
    expect(screen.getByText('Succès / Difficultés / Idées')).toBeTruthy();
    expect(screen.getByText("J'ai aimé / J'ai moins aimé / Propositions")).toBeTruthy();
    expect(screen.getByText('Conserver / Améliorer / Innover')).toBeTruthy();
    expect(screen.getByText('Bien passé / À améliorer / Prochaines actions')).toBeTruthy();
    expect(screen.queryByText('Mad / Sad / Glad')).toBeNull();
    expect(screen.queryByText('Créer un format personnalisé…')).toBeNull();
  });

  it('sélectionner un preset appelle onSelectPreset avec ses colonnes', () => {
    const onSelectPreset = vi.fn();
    render(
      <RetroFormatSelector
        formatName="Commencer / Arrêter / Continuer"
        isFacilitator
        onSelectPreset={onSelectPreset}
      />
    );

    fireEvent.change(screen.getByLabelText('Format de la rétrospective'), { target: { value: 'Succès / Difficultés / Idées' } });

    expect(onSelectPreset).toHaveBeenCalledWith('Succès / Difficultés / Idées', ['Succès', 'Difficultés', 'Idées']);
  });

  it('conserve l\'affichage du format courant si une ancienne session porte un libellé inconnu', () => {
    render(
      <RetroFormatSelector
        formatName="Ancien format"
        isFacilitator
        onSelectPreset={vi.fn()}
      />
    );

    const select = screen.getByLabelText('Format de la rétrospective') as HTMLSelectElement;
    expect(select.value).toBe('Ancien format');
    expect(screen.getByText('Ancien format')).toBeTruthy();
  });
});
