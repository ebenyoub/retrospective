import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionDashboard from '../SessionDashboard';
import { emptyCardsResponse, createDashboardFetchMock } from './sessionTestUtils';

const { ioMock, authState } = vi.hoisted(() => {
  const socket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  return {
    ioMock: vi.fn(() => socket),
    authState: {
      isAuthenticated: true,
      token: 'test-token',
      userId: 1,
      username: 'Elyas',
      email: 'e@test.com',
    },
  };
});

vi.mock('socket.io-client', () => ({ io: ioMock }));

vi.mock('@/context/toast/useToast', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({
    ...authState,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Helper pour simuler la largeur d'écran
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const isMobile = query.includes('767px');
      const isDesktop = query.includes('1152px');
      let matches = false;
      if (isMobile && width <= 767) matches = true;
      if (isDesktop && width >= 1152) matches = true;
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
  window.dispatchEvent(new Event('resize'));
};

describe('SessionDashboard - Responsive Navigation & Actions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', createDashboardFetchMock({
      cardsSequence: [emptyCardsResponse],
      step: 'writing',
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderDashboard = () => {
    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <Routes>
          <Route path="/session/:id" element={<SessionDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('Desktop (>= 1152px) : affiche le nom complet et masque RTC sur grands écrans, progression complète présente', async () => {
    setViewportWidth(1200);
    renderDashboard();

    // Nom complet du produit visible
    const brandFull = await screen.findByText('Range ta chambre');
    const brandShort = screen.getByText('RTC');

    expect(brandFull).toBeTruthy();
    expect(brandShort.className).toContain('sm:hidden');

    // Progression complète (StepIndicator) est présente
    expect(screen.getByLabelText('Progression de la session')).toBeTruthy();

    // Libellés d'action complets pour le facilitateur
    expect(screen.getByLabelText('Étape précédente')).toBeTruthy();
    expect(screen.getByText('Étape précédente')).toBeTruthy();
    expect(screen.getByText('Terminer la session')).toBeTruthy();
    expect(screen.getByText('Passer au vote')).toBeTruthy();
  });

  it('Tablette (768px - 1151px) : affiche Range ta chambre et la progression compacte avec libellés raccourcis', async () => {
    setViewportWidth(900);
    renderDashboard();

    // Nom Range ta chambre présent sur tablette (dès 640px)
    const brandFull = await screen.findByText('Range ta chambre');
    expect(brandFull).toBeTruthy();

    // Progression compacte (StepIndicatorCompact) visible
    expect(screen.getByLabelText(/Progression de la session : étape 2/)).toBeTruthy();
    expect(screen.getByText('Écriture des cartes')).toBeTruthy();

    // Actions avec libellés compacts
    expect(screen.getByText('Précédent')).toBeTruthy();
    expect(screen.getByText('Terminer')).toBeTruthy();
    expect(screen.getByText('Voter')).toBeTruthy();
  });

  it('Mobile (< 768px) : affiche RTC, progression très compacte (nom court) et icônes seules', async () => {
    setViewportWidth(400);
    renderDashboard();

    // Nom court RTC visible
    expect(await screen.findByText('RTC')).toBeTruthy();

    // Progression très compacte (Écriture) visible et Écriture des cartes masquée
    expect(screen.getByLabelText(/Progression de la session : étape 2/)).toBeTruthy();
    expect(screen.getByText('Écriture')).toBeTruthy();
    expect(screen.getByText('Écriture des cartes').className).toContain('hidden');

    // Icônes seules pour les actions facilitateur (textes masqués)
    const prevBtn = screen.getByLabelText('Étape précédente');
    const closeBtn = screen.getByLabelText('Terminer la session');
    const nextBtn = screen.getByLabelText('Passer au vote');

    expect(prevBtn).toBeTruthy();
    expect(closeBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
  });
});
