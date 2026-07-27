import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResumeSessionCard from '../ResumeSessionCard';

const renderCard = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ResumeSessionCard />} />
        <Route path="/session/:id" element={<p>Page de session</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('ResumeSessionCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("n'affiche rien si aucune session n'est active", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: null }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderCard();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText('Revenir à la session en cours')).toBeNull();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('affiche le bouton de reprise et ramène vers la session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { sessionId: 3, sessionName: 'Retro Sprint 12', displayName: 'Sarah' } }),
    }));

    renderCard();

    const button = await screen.findByText('Revenir à la session en cours');
    expect(screen.getByText(/Retro Sprint 12/)).toBeTruthy();

    fireEvent.click(button);
    expect(await screen.findByText('Page de session')).toBeTruthy();
  });

  it("ne touche pas à l'identité invitée stockée si la session n'est pas reprenable automatiquement (ex: clôturée)", async () => {
    // data: null ne signifie pas que l'identité stockée est invalide : le
    // backend renvoie la même réponse quand la session a simplement été
    // clôturée. Effacer `retro:guest:{sessionId}` ici empêcherait
    // useSessionIdentity de rouvrir cette session en lecture seule sous le
    // même pseudo (bug remonté : une session clôturée redemandait un pseudo
    // alors qu'un pseudo invité existait déjà).
    localStorage.setItem('retro:guest:3', JSON.stringify({ participantId: 9, guestToken: 'guest-9', displayName: 'Sarah' }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: null }),
    }));

    renderCard();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText('Revenir à la session en cours')).toBeNull();
    expect(localStorage.getItem('retro:guest:3')).not.toBeNull();
  });
});
