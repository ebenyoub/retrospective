import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JoinSessionModal from '../JoinSessionModal';

const jsonResponse = (body: unknown, ok = true, status = ok ? 200 : 400) => ({ ok, status, json: async () => body });

describe('JoinSessionModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche le formulaire pseudo avec le bouton Rejoindre la session', () => {
    render(<JoinSessionModal sessionId="1" onJoined={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText('Pseudo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Rejoindre la session' })).toBeTruthy();
  });

  it('affiche une erreur de validation sous le champ si le pseudo est trop court', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<JoinSessionModal sessionId="1" onJoined={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'E' } });
    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre la session' }));

    expect(await screen.findByText('Le pseudo doit contenir au moins 2 caractères.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejoint la session avec un pseudo disponible et le conserve tel quel (sans suffixe)', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 9, displayName: 'EBNoob', role: 'participant', guestToken: 'secret' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    const onJoined = vi.fn();

    render(<JoinSessionModal sessionId="1" onJoined={onJoined} />);

    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'EBNoob' } });
    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre la session' }));

    await vi.waitFor(() => {
      expect(onJoined).toHaveBeenCalledWith({ id: 9, displayName: 'EBNoob', role: 'participant', guestToken: 'secret' });
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/session/1/participants/guest-join',
      expect.objectContaining({ body: JSON.stringify({ pseudo: 'EBNoob' }) })
    );
  });

  it('affiche sous le champ une erreur claire si le pseudo est déjà pris (pas de suffixe automatique)', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({ success: false, message: 'Ce pseudo est déjà utilisé dans cette session.' }, false, 409)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<JoinSessionModal sessionId="1" onJoined={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'EBNoob' } });
    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre la session' }));

    expect(await screen.findByText('Ce pseudo est déjà utilisé dans cette session.')).toBeTruthy();
  });

  it('affiche un message clair si la session est complète', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ success: false, message: '' }, false, 403));
    vi.stubGlobal('fetch', fetchMock);

    render(<JoinSessionModal sessionId="1" onJoined={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'EBNoob' } });
    fireEvent.click(screen.getByRole('button', { name: 'Rejoindre la session' }));

    expect(await screen.findByText('Cette session est complète.')).toBeTruthy();
  });
});
