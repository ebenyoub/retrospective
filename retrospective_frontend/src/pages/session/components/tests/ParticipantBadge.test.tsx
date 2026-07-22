import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParticipantBadge from '../ParticipantBadge';

const renderBadge = (overrides: Partial<Parameters<typeof ParticipantBadge>[0]> = {}) => {
  const props = {
    displayName: 'Sarah',
    canRename: true,
    isReadOnly: false,
    onRename: vi.fn().mockResolvedValue(true),
    onLeave: vi.fn(),
    ...overrides,
  };
  render(<ParticipantBadge {...props} />);
  return props;
};

describe('ParticipantBadge', () => {
  it('affiche le pseudo du participant', () => {
    renderBadge();

    expect(screen.getByRole('button', { name: 'Menu du participant Sarah' })).toBeTruthy();
    expect(screen.getByText('Sarah')).toBeTruthy();
  });

  it('permet de modifier son pseudo avec un pseudo valide', async () => {
    const props = renderBadge();

    fireEvent.click(screen.getByRole('button', { name: 'Menu du participant Sarah' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Modifier le pseudo' }));

    const input = screen.getByLabelText('Nouveau pseudo');
    // Prérempli avec le pseudo actuel.
    expect((input as HTMLInputElement).value).toBe('Sarah');

    fireEvent.change(input, { target: { value: 'Sarah B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await vi.waitFor(() => expect(props.onRename).toHaveBeenCalledWith('Sarah B'));
  });

  it('bloque un pseudo invalide avec les mêmes règles qu\'à l\'entrée, sans appel backend', async () => {
    const props = renderBadge();

    fireEvent.click(screen.getByRole('button', { name: 'Menu du participant Sarah' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Modifier le pseudo' }));

    const input = screen.getByLabelText('Nouveau pseudo');
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    expect(await screen.findByText('Le pseudo doit contenir au moins 2 caractères.')).toBeTruthy();
    expect(props.onRename).not.toHaveBeenCalled();
  });

  it('ne propose pas la modification du pseudo quand canRename est faux (utilisateur connecté)', () => {
    renderBadge({ canRename: false });

    fireEvent.click(screen.getByRole('button', { name: 'Menu du participant Sarah' }));

    expect(screen.queryByRole('menuitem', { name: 'Modifier le pseudo' })).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Quitter la session' })).toBeTruthy();
  });

  it('déclenche la sortie de session depuis le menu', () => {
    const props = renderBadge();

    fireEvent.click(screen.getByRole('button', { name: 'Menu du participant Sarah' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Quitter la session' }));

    expect(props.onLeave).toHaveBeenCalledOnce();
  });

  it('ne propose aucune action mutatrice en lecture seule', () => {
    renderBadge({ isReadOnly: true });

    fireEvent.click(screen.getByRole('button', { name: 'Menu du participant Sarah' }));

    expect(screen.queryByRole('menuitem', { name: 'Modifier le pseudo' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Quitter la session' })).toBeNull();
  });
});
