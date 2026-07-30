import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RetroFormatSelector from '../RetroFormatSelector';

describe('RetroFormatSelector', () => {
  it('participant : affiche un simple libellé en lecture seule (pas de dropdown)', () => {
    render(
      <RetroFormatSelector
        formatName="Succès / Difficultés / Idées"
        isFacilitator={false}
        onSelectPreset={vi.fn()}
      />
    );

    expect(screen.getByText('Succès / Difficultés / Idées')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /format/i })).toBeNull();
  });

  it('facilitateur : affiche le format choisi et permet d\'ouvrir la liste', () => {
    render(
      <RetroFormatSelector
        formatName="Commencer / Arrêter / Continuer"
        isFacilitator
        onSelectPreset={vi.fn()}
      />
    );

    const button = screen.getByRole('button');
    expect(button.textContent).toBe('Commencer / Arrêter / Continuer');

    // Cliquer pour ouvrir
    fireEvent.click(button);

    expect(screen.getByText('Points positifs / Points négatifs / Actions')).toBeTruthy();
    expect(screen.getByText('Succès / Difficultés / Idées')).toBeTruthy();
    expect(screen.getByText("J'ai aimé / J'ai moins aimé / Propositions")).toBeTruthy();
    expect(screen.getByText('Conserver / Améliorer / Innover')).toBeTruthy();
    expect(screen.getByText('Bien passé / À améliorer / Prochaines actions')).toBeTruthy();
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

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const option = screen.getByText('Succès / Difficultés / Idées');
    fireEvent.click(option);

    expect(onSelectPreset).toHaveBeenCalledWith('Succès / Difficultés / Idées', ['Succès', 'Difficultés', 'Idées']);
  });
});
