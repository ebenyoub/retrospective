import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WaitingScreen } from '../WaitingScreen';
import type { ParticipantSummary } from '../../types/participant.types';

const makeParticipant = (overrides: Partial<ParticipantSummary> = {}): ParticipantSummary => ({
  id: 1,
  sessionId: 1,
  displayName: 'Elyas',
  role: 'facilitator',
  status: 'online',
  joinedAt: '2026-07-10T10:00:00.000Z',
  lastSeenAt: '2026-07-10T10:00:00.000Z',
  ...overrides,
});

const baseProps = {
  sessionId: '1',
  sessionName: 'Retro Sprint 42',
  sessionCode: '1234',
  selfParticipantId: 1,
  formatName: 'Commencer / Arrêter / Continuer',
  onStart: vi.fn(),
  onLeave: vi.fn(),
  onSelectFormatPreset: vi.fn(),
  stepDurationMinutes: 5,
  onUpdateStepDuration: vi.fn(),
  isDesktop: true,
};

describe('WaitingScreen', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('affiche la liste des participants avec badge Facilitateur (pas "Admin")', () => {
    const participants = [
      makeParticipant({ id: 1, displayName: 'Elyas', role: 'facilitator' }),
      makeParticipant({ id: 2, displayName: 'EBNoob', role: 'participant', status: 'offline' }),
    ];

    render(<WaitingScreen {...baseProps} role="facilitator" participants={participants} />);

    expect(screen.getAllByText('Elyas').length).toBeGreaterThan(0);
    expect(screen.getByText('EBNoob')).toBeTruthy();
    expect(screen.getByText('Facilitateur')).toBeTruthy();
    expect(screen.queryByText('Admin')).toBeNull();
    expect(screen.getByText('En ligne')).toBeTruthy();
    expect(screen.getByText('Hors ligne')).toBeTruthy();
  });



  it('affiche un résumé unique sans répétition (pas de doublon "participants connectés")', () => {
    render(<WaitingScreen {...baseProps} role="facilitator" participants={[makeParticipant({ id: 1 })]} />);

    expect(screen.getByText('1 participant · 1 en ligne')).toBeTruthy();
    expect(screen.queryByText(/participants connectés/)).toBeNull();
    expect(screen.queryByText(/inscrits,/)).toBeNull();
  });

  it('facilitateur : voit le bouton Lancer la rétro et le sélecteur de format', () => {
    render(<WaitingScreen {...baseProps} role="facilitator" participants={[makeParticipant()]} />);

    expect(screen.getByRole('button', { name: /Lancer la rétro/ })).toBeTruthy();
    expect(screen.getByLabelText('Format de la rétrospective')).toBeTruthy();
  });

  it("participant : voit l'état d'attente, pas le bouton de lancement ni le sélecteur", () => {
    render(
      <WaitingScreen
        {...baseProps}
        role="participant"
        selfParticipantId={2}
        participants={[makeParticipant({ id: 1 }), makeParticipant({ id: 2, displayName: 'EBNoob', role: 'participant' })]}
      />
    );

    expect(screen.getByText('En attente du lancement par le facilitateur...')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Lancer la rétro/ })).toBeNull();
    expect(screen.queryByLabelText('Format de la rétrospective')).toBeNull();
    expect(screen.getByText('Commencer / Arrêter / Continuer')).toBeTruthy();
  });

  it('copie le code de session via le presse-papiers', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<WaitingScreen {...baseProps} role="facilitator" participants={[makeParticipant()]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copier le code de session' }));

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('1234'));
    expect(await screen.findByRole('button', { name: 'Code copié' })).toBeTruthy();
  });

  it('bouton Quitter la session appelle onLeave', () => {
    const onLeave = vi.fn();
    render(<WaitingScreen {...baseProps} role="participant" onLeave={onLeave} participants={[makeParticipant()]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Quitter la session' }));
    expect(onLeave).toHaveBeenCalled();
  });
});
