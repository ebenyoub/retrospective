import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const { authState } = vi.hoisted(() => ({
  authState: { isAuthenticated: false },
}));

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated, logout: vi.fn() }),
}));

const renderHeader = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>
  );

describe('Header', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
  });

  it("masque Connexion et S'inscrire sur l'accueil pour un visiteur non connecté", () => {
    renderHeader('/');

    expect(screen.queryByText('Connexion')).toBeNull();
    expect(screen.queryByText("S'inscrire")).toBeNull();
  });

  it("affiche Connexion et S'inscrire sur les autres pages pour un visiteur non connecté", () => {
    renderHeader('/sessions');

    expect(screen.getByText('Connexion')).toBeTruthy();
    expect(screen.getByText("S'inscrire")).toBeTruthy();
  });

  it("masque Connexion et S'inscrire sur une session pour un participant invité", () => {
    renderHeader('/session/123');

    expect(screen.queryByText('Connexion')).toBeNull();
    expect(screen.queryByText("S'inscrire")).toBeNull();
  });

  it("affiche le menu Profil (avec Déconnexion dedans) sur l'accueil pour un utilisateur connecté", () => {
    authState.isAuthenticated = true;

    renderHeader('/');

    expect(screen.queryByText('Connexion')).toBeNull();

    const trigger = screen.getByRole('button', { name: 'Profil' });
    expect(screen.queryByText('Déconnexion')).toBeNull();

    fireEvent.click(trigger);

    expect(screen.getByText('Déconnexion')).toBeTruthy();
    expect(screen.getByText('Mes sessions')).toBeTruthy();
  });
});
