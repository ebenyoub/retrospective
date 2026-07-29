import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../home';

const { authState } = vi.hoisted(() => ({
  authState: { isAuthenticated: false },
}));

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}));

vi.mock('../session/services/sessionApi', () => ({
  listSessions: vi.fn().mockResolvedValue({ ok: true, data: [] }),
}));

// Pour ResumeSessionCard
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true, data: null }),
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe('Home Page', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
  });

  it('n\'affiche pas la liste des sessions si l\'utilisateur n\'est pas connecté', () => {
    renderHome();

    expect(screen.queryByText('Mes sessions récentes')).toBeNull();
  });

  it('affiche la liste des sessions si l\'utilisateur est connecté', () => {
    authState.isAuthenticated = true;
    renderHome();

    expect(screen.getByText('Mes sessions récentes')).toBeTruthy();
  });
});
