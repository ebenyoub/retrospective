import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '@/context/toast/ToastContext';
import CreateSessionForm from '../CreateSessionForm';

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
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
    fireEvent.change(screen.getByLabelText('Format de rétro'), { target: { value: 'success-difficulties-ideas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer et lancer' }));

    await vi.waitFor(() => expect(onSessionCreated).toHaveBeenCalledWith(7));
    // L'authentification passe par le cookie (credentials), plus par un header.
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/session/create-session',
      expect.objectContaining({ credentials: 'include' })
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({
      name: 'Sprint 43',
      formatName: 'Succès / Difficultés / Idées',
      formatColumns: ['Succès', 'Difficultés', 'Idées'],
      stepDurationMinutes: 5,
    });
  });

  it('affiche uniquement les 6 formats MVP validés', () => {
    renderForm();

    expect(Array.from(screen.getByLabelText('Format de rétro').querySelectorAll('option')).map((option) => option.textContent)).toEqual([
      'Commencer / Arrêter / Continuer',
      'Points positifs / Points négatifs / Actions',
      'Succès / Difficultés / Idées',
      "J'ai aimé / J'ai moins aimé / Propositions",
      'Conserver / Améliorer / Innover',
      'Bien passé / À améliorer / Prochaines actions',
    ]);
  });
});
