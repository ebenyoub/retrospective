import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionList from './SessionList';

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    token: 'test-token',
    userId: 1,
    username: 'Elyas',
    email: 'e@test.com',
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const renderSessionList = () =>
  render(
    <MemoryRouter initialEntries={['/sessions']}>
      <Routes>
        <Route path="/sessions" element={<SessionList />} />
        <Route path="/session/:id" element={<div>Dashboard de session</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('SessionList', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche un état vide si aucune session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) })
    );

    renderSessionList();

    expect(await screen.findByText("Aucune session pour l'instant.")).toBeTruthy();
  });

  it('affiche les sessions reçues avec leur rôle et leur statut', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              code: '1234',
              status: 'open',
              expiresAt: '2026-07-08T10:00:00.000Z',
              createdAt: '2026-07-08T09:00:00.000Z',
              role: 'facilitator',
            },
            {
              id: 2,
              code: '5678',
              status: 'closed',
              expiresAt: '2026-07-08T10:00:00.000Z',
              createdAt: '2026-07-08T09:00:00.000Z',
              role: 'participant',
            },
          ],
        }),
      })
    );

    renderSessionList();

    expect(await screen.findByText('Code 1234')).toBeTruthy();
    expect(screen.getByText('Code 5678')).toBeTruthy();
    expect(screen.getByText(/Facilitateur/)).toBeTruthy();
    expect(screen.getByText(/Participant/)).toBeTruthy();
  });

  it('navigue vers le tableau de session au clic sur une session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              code: '1234',
              status: 'open',
              expiresAt: '2026-07-08T10:00:00.000Z',
              createdAt: '2026-07-08T09:00:00.000Z',
              role: 'facilitator',
            },
          ],
        }),
      })
    );

    renderSessionList();

    fireEvent.click(await screen.findByText('Code 1234'));

    expect(await screen.findByText('Dashboard de session')).toBeTruthy();
  });
});
