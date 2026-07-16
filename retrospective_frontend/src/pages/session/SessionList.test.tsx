import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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

const addToastMock = vi.fn();
vi.mock('@/context/toast/useToast', () => ({
  useToast: () => ({
    addToast: addToastMock,
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
    addToastMock.mockReset();
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
              name: 'Rétro Sprint 1',
              code: '1234',
              status: 'open',
              expiresAt: '2026-07-08T10:00:00.000Z',
              createdAt: '2026-07-08T09:00:00.000Z',
              role: 'facilitator',
            },
            {
              id: 2,
              name: 'Rétro Sprint 2',
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

    expect((await screen.findAllByText('Rétro Sprint 1')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rétro Sprint 2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1234').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5678').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Facilitateur/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Participant/).length).toBeGreaterThan(0);
  });

  it("affiche le message d'erreur API si le chargement échoue", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, message: 'Session introuvable.' }),
      })
    );

    renderSessionList();

    expect(await screen.findByText('Session introuvable.')).toBeTruthy();
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
              name: 'Rétro Sprint 1',
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

    fireEvent.click((await screen.findAllByText('Rétro Sprint 1'))[0]);

    expect(await screen.findByText('Dashboard de session')).toBeTruthy();
  });

  it('navigue vers l\'accueil sans état de navigation au clic sur le bouton Retour', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) })
    );

    const LocationDisplay = () => {
      const location = useLocation();
      return (
        <>
          <p>Page d'accueil</p>
          <output data-testid="location-state">{JSON.stringify(location.state)}</output>
        </>
      );
    };

    render(
      <MemoryRouter initialEntries={['/sessions']}>
        <Routes>
          <Route path="/sessions" element={<SessionList />} />
          <Route path="/" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: "← Retour à l'accueil" }));

    expect(await screen.findByText('Page d\'accueil')).toBeTruthy();
    expect(screen.getByTestId('location-state').textContent).toBe(JSON.stringify(null));
  });

  it('renomme une session de manière réussie', async () => {
    const fetchSpy = vi.fn().mockImplementation((url, init) => {
      const method = init?.method ?? 'GET';
      if (method === 'PATCH' && url.includes('/session/1/name')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              name: 'Ancien Nom',
              code: '1234',
              status: 'open',
              expiresAt: '2026-07-08T10:00:00.000Z',
              createdAt: '2026-07-08T09:00:00.000Z',
              role: 'facilitator',
            },
          ],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    renderSessionList();

    // Clique sur le bouton Renommer du tableau desktop
    const renameButtons = await screen.findAllByTitle('Modifier le nom de la session');
    fireEvent.click(renameButtons[0]);

    // L'input s'affiche avec la valeur actuelle (à la fois sur mobile et desktop)
    const inputs = screen.getAllByDisplayValue('Ancien Nom');
    fireEvent.change(inputs[0], { target: { value: 'Nouveau Nom Rétro' } });

    // Clique sur Sauver
    const saveButton = screen.getByRole('button', { name: 'Sauver' });
    fireEvent.click(saveButton);

    // L'API a été appelée et le toast de succès s'affiche
    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.some(([url, init]) => url.includes('/session/1/name') && init.method === 'PATCH')).toBe(true);
      expect(addToastMock).toHaveBeenCalledWith('success', 'Nom de la session mis à jour.');
    });
  });

  it('supprime une session de manière réussie via la modale de confirmation', async () => {
    const fetchSpy = vi.fn().mockImplementation((url, init) => {
      const method = init?.method ?? 'GET';
      if (method === 'DELETE' && url.includes('/session/1')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              name: 'Rétro à supprimer',
              code: '1234',
              status: 'open',
              expiresAt: '2026-07-08T10:00:00.000Z',
              createdAt: '2026-07-08T09:00:00.000Z',
              role: 'facilitator',
            },
          ],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    renderSessionList();

    // Ouvre la modale
    const deleteButtons = await screen.findAllByTitle('Supprimer la session');
    fireEvent.click(deleteButtons[0]);

    // La modale s'affiche
    expect(await screen.findByText('Confirmer la suppression')).toBeTruthy();

    // Confirme la suppression via le bouton de la modale uniquement
    const modal = screen.getByRole('dialog');
    const confirmButton = within(modal).getByRole('button', { name: 'Supprimer' });
    fireEvent.click(confirmButton);

    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.some(([url, init]) => url.endsWith('/session/1') && init.method === 'DELETE')).toBe(true);
      expect(addToastMock).toHaveBeenCalledWith('success', 'La session a été supprimée avec succès.');
    });
  });

  it("affiche un toast d'erreur si la modification du nom échoue côté API", async () => {
    const fetchSpy = vi.fn().mockImplementation((url, init) => {
      const method = init?.method ?? 'GET';
      if (method === 'PATCH' && url.includes('/session/1/name')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ success: false, message: 'Nom de session invalide ou doublon.' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              name: 'Ancien Nom',
              code: '1234',
              status: 'open',
              expiresAt: '2026-07-08T10:00:00.000Z',
              createdAt: '2026-07-08T09:00:00.000Z',
              role: 'facilitator',
            },
          ],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    renderSessionList();

    const renameButtons = await screen.findAllByTitle('Modifier le nom de la session');
    fireEvent.click(renameButtons[0]);

    const inputs = screen.getAllByDisplayValue('Ancien Nom');
    fireEvent.change(inputs[0], { target: { value: 'Nouveau Nom Rétro' } });

    const saveButton = screen.getByRole('button', { name: 'Sauver' });
    fireEvent.click(saveButton);

    await vi.waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith('error', 'Nom de session invalide ou doublon.');
    });
  });
});
