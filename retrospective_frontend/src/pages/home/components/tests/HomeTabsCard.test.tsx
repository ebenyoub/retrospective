import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@/context/toast/ToastContext';
import HomeTabsCard from '../HomeTabsCard';

const { authState } = vi.hoisted(() => ({
  authState: { isAuthenticated: false, token: '' },
}));

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ ...authState, login: vi.fn() }),
}));

const renderHomeTabsCard = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <HomeTabsCard />
      </ToastProvider>
    </MemoryRouter>
  );

describe('HomeTabsCard', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.token = '';
  });

  it('affiche le formulaire de création de compte pour un visiteur non connecté', () => {
    renderHomeTabsCard();

    expect(screen.getByLabelText('Prénom')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Créer et lancer' })).toBeTruthy();
  });

  it('affiche le formulaire simplifié pour un facilitateur déjà connecté', () => {
    authState.isAuthenticated = true;
    authState.token = 'existing-token';

    renderHomeTabsCard();

    expect(screen.queryByLabelText('Prénom')).toBeNull();
    expect(screen.getByLabelText('Nom de la rétro')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Créer et lancer' })).toBeTruthy();
  });

  it("bascule vers le formulaire de jonction (code + pseudo) au clic sur l'onglet Rejoindre", () => {
    renderHomeTabsCard();

    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre' }));

    expect(screen.getByLabelText('Chiffre 1 du code')).toBeTruthy();
    expect(screen.getByLabelText('Prénom ou pseudo')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Rejoindre →/ })).toBeTruthy();
  });
});
