import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '@/context/toast/ToastContext';
import JoinSessionForm from './JoinSessionForm';

const jsonResponse = (body: unknown, ok = true) => ({ ok, json: async () => body });

const renderForm = (onSessionJoined = vi.fn()) => {
  render(
    <ToastProvider>
      <JoinSessionForm onSessionJoined={onSessionJoined} />
    </ToastProvider>
  );
  return onSessionJoined;
};

const fillCode = (code: string) => {
  code.split('').forEach((digit, index) => {
    fireEvent.change(screen.getByLabelText(`Chiffre ${index + 1} du code`), { target: { value: digit } });
  });
};

describe('JoinSessionForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche les erreurs de champ requis sous le code et le pseudo, sans toast', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /Rejoindre/ }));

    expect(await screen.findByText('Le code de session est obligatoire.')).toBeTruthy();
    expect(screen.getByText('Le prénom ou le pseudo est obligatoire.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    // Aucun toast global du type "Veuillez renseigner le code et le prénom."
    expect(screen.queryByText(/Veuillez renseigner/)).toBeNull();
  });

  it('rejoint la session sans compte et transmet le sessionId au succès', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { id: 9, guestToken: 'guest-token', displayName: 'Sarah', sessionId: 3 },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const onSessionJoined = renderForm();
    fillCode('1234');
    fireEvent.change(screen.getByLabelText('Prénom ou pseudo'), { target: { value: 'Sarah' } });
    fireEvent.click(screen.getByRole('button', { name: /Rejoindre/ }));

    await vi.waitFor(() => expect(onSessionJoined).toHaveBeenCalledWith(3));
    expect(localStorage.getItem('retro:guest:3')).toBe(
      JSON.stringify({ participantId: 9, guestToken: 'guest-token', displayName: 'Sarah' })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/session/join-guest',
      expect.objectContaining({ body: JSON.stringify({ code: '1234', pseudo: 'Sarah' }) })
    );
  });

  it('affiche une erreur sous le code si le code ne correspond à aucune session', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({ success: false, message: 'Aucune session ne correspond à ce code.' }, false)
    );
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fillCode('9999');
    fireEvent.change(screen.getByLabelText('Prénom ou pseudo'), { target: { value: 'Sarah' } });
    fireEvent.click(screen.getByRole('button', { name: /Rejoindre/ }));

    expect(await screen.findByText('Aucune session ne correspond à ce code.')).toBeTruthy();
  });

  it('affiche un message réseau sous le formulaire si aucune réponse du serveur (fetch échoue)', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fillCode('1234');
    fireEvent.change(screen.getByLabelText('Prénom ou pseudo'), { target: { value: 'Sarah' } });
    fireEvent.click(screen.getByRole('button', { name: /Rejoindre/ }));

    expect(await screen.findByText('Erreur de connexion au serveur.')).toBeTruthy();
  });
});
