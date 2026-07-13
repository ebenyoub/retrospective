import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomFormatModal from './CustomFormatModal';

describe('CustomFormatModal', () => {
  it('affiche 2 colonnes vides par défaut et le nom initial', () => {
    render(<CustomFormatModal initialName="Mon format" onValidate={vi.fn()} onCancel={vi.fn()} />);

    expect((screen.getByLabelText('Nom du format') as HTMLInputElement).value).toBe('Mon format');
    expect(screen.getByLabelText('Nom de la colonne 1')).toBeTruthy();
    expect(screen.getByLabelText('Nom de la colonne 2')).toBeTruthy();
    expect(screen.queryByLabelText('Nom de la colonne 3')).toBeNull();
  });

  it('refuse moins de 2 colonnes remplies (erreur de validation, pas de soumission)', async () => {
    const onValidate = vi.fn();
    render(<CustomFormatModal onValidate={onValidate} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nom du format'), { target: { value: 'Format test' } });
    fireEvent.change(screen.getByLabelText('Nom de la colonne 1'), { target: { value: 'Colonne A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    expect(await screen.findByText('Le nom de la colonne est requis.')).toBeTruthy();
    expect(onValidate).not.toHaveBeenCalled();
  });

  it('ajoute des colonnes jusqu\'à 5 puis désactive le bouton d\'ajout', () => {
    render(<CustomFormatModal onValidate={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByText('+ Ajouter une colonne'));
    fireEvent.click(screen.getByText('+ Ajouter une colonne'));
    fireEvent.click(screen.getByText('+ Ajouter une colonne'));

    expect(screen.getByLabelText('Nom de la colonne 5')).toBeTruthy();
    expect(screen.queryByText('+ Ajouter une colonne')).toBeNull();
  });

  it('valide un format personnalisé complet', async () => {
    const onValidate = vi.fn();
    render(<CustomFormatModal onValidate={onValidate} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nom du format'), { target: { value: 'Mon format' } });
    fireEvent.change(screen.getByLabelText('Nom de la colonne 1'), { target: { value: 'Colonne A' } });
    fireEvent.change(screen.getByLabelText('Nom de la colonne 2'), { target: { value: 'Colonne B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await vi.waitFor(() => {
      expect(onValidate).toHaveBeenCalledWith('Mon format', ['Colonne A', 'Colonne B']);
    });
  });

  it('Échap ferme la modale (onCancel)', () => {
    const onCancel = vi.fn();
    render(<CustomFormatModal onValidate={vi.fn()} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('Annuler ferme la modale sans valider', () => {
    const onCancel = vi.fn();
    const onValidate = vi.fn();
    render(<CustomFormatModal onValidate={onValidate} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onValidate).not.toHaveBeenCalled();
  });
});
