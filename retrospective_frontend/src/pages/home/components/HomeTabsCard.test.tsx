import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeTabsCard from './HomeTabsCard';

describe('HomeTabsCard', () => {
  it('affiche le formulaire de création par défaut', () => {
    render(<HomeTabsCard />);

    expect(screen.getByPlaceholderText('Sprint 42 – Revue')).toBeTruthy();
    expect(screen.queryByPlaceholderText('1234')).toBeNull();
  });

  it("bascule vers le formulaire de jonction au clic sur l'onglet Rejoindre", () => {
    render(<HomeTabsCard />);

    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre' }));

    expect(screen.getByPlaceholderText('1234')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Sprint 42 – Revue')).toBeNull();
  });

  it('appelle onCreateSession avec le nom de la rétro et le prénom saisis', () => {
    const onCreateSession = vi.fn();
    render(<HomeTabsCard onCreateSession={onCreateSession} />);

    fireEvent.change(screen.getByPlaceholderText('Sprint 42 – Revue'), {
      target: { value: 'Sprint 43 – Revue' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ex : Elyas'), {
      target: { value: 'Elyas' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lancer la rétro/ }));

    expect(onCreateSession).toHaveBeenCalledWith('Sprint 43 – Revue', 'Elyas');
  });

  it('appelle onJoinSession avec le code saisi (limité à 4 chiffres)', () => {
    const onJoinSession = vi.fn();
    render(<HomeTabsCard onJoinSession={onJoinSession} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre' }));
    fireEvent.change(screen.getByPlaceholderText('1234'), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Rejoindre →/ }));

    expect(onJoinSession).toHaveBeenCalledWith('1234');
  });
});
