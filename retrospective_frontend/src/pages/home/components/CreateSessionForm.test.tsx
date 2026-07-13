import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '@/context/toast/ToastContext';
import CreateSessionForm from './CreateSessionForm';

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ token: 'existing-token' }),
}));

const jsonResponse = (body: unknown, ok = true) => ({ ok, json: async () => body });

const renderForm = (onSessionCreated = vi.fn()) => {
  render(
    <ToastProvider>
      <CreateSessionForm onSessionCreated={onSessionCreated} />
    </ToastProvider>
  );
  return onSessionCreated;
};

describe('CreateSessionForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche une erreur sous le champ si le nom de la rétro est absent, sans appeler le serveur', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fireEvent.change(screen.getByLabelText('Nom de la rétro'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer et lancer' }));

    expect(await screen.findByText('Le nom de la rétrospective doit contenir au moins 3 caractères.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('crée la session et transmet le sessionId au succès', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ success: true, data: { sessionId: 7 } }));
    vi.stubGlobal('fetch', fetchMock);

    const onSessionCreated = renderForm();
    fireEvent.change(screen.getByLabelText('Nom de la rétro'), { target: { value: 'Sprint 43' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer et lancer' }));

    await vi.waitFor(() => expect(onSessionCreated).toHaveBeenCalledWith(7));
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/session/create-session',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer existing-token' }) })
    );
  });
});
