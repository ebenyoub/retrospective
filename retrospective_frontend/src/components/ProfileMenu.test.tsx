import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

const mockLogout = vi.fn();

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ username: 'Elyas', logout: mockLogout }),
}));

const renderMenu = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ProfileMenu />} />
        <Route path="/sessions" element={<p>Mes sessions page</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProfileMenu', () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  it("n'affiche pas le menu avant le clic (aria-expanded=false)", () => {
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Elyas' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('ouvre le menu au clic avec les 4 entrées attendues', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Elyas' }));

    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Mes sessions' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Rejoindre une session' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Créer une rétrospective' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Déconnexion' })).toBeTruthy();
  });

  it('ferme le menu avec Échap et rend le focus au bouton', () => {
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Elyas' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeTruthy();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('ferme le menu au clic extérieur', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <div>
          <ProfileMenu />
          <button type="button">Ailleurs</button>
        </div>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Elyas' }));
    expect(screen.getByRole('menu')).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Ailleurs' }));

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('ferme le menu après sélection et déclenche la déconnexion', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Elyas' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Déconnexion' }));

    expect(mockLogout).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('navigue vers "Mes sessions" et ferme le menu', async () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Elyas' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Mes sessions' }));

    expect(await screen.findByText('Mes sessions page')).toBeTruthy();
  });

  it('la navigation clavier ArrowDown déplace le focus entre les entrées', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Elyas' }));
    const firstItem = screen.getByRole('menuitem', { name: 'Mes sessions' });
    expect(document.activeElement).toBe(firstItem);

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });

    const secondItem = screen.getByRole('menuitem', { name: 'Rejoindre une session' });
    expect(document.activeElement).toBe(secondItem);
  });
});
