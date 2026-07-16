import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TimerChip from '../TimerChip';

describe('TimerChip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("affiche le temps restant calculé depuis l'échéance commune, pas un décompte local", () => {
    // Échéance dans 3 min 40 s : tous les clients affichent la même valeur.
    render(<TimerChip endsAt="2026-07-15T10:03:40.000Z" />);

    expect(screen.getByText('03:40')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText('03:30')).toBeTruthy();
  });

  it("reste à 00:00 une fois l'échéance dépassée", () => {
    render(<TimerChip endsAt="2026-07-15T09:59:00.000Z" />);

    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it("n'est pas cliquable pour un participant", () => {
    render(<TimerChip endsAt="2026-07-15T10:05:00.000Z" />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('permet au facilitateur de saisir une nouvelle durée, envoyée au backend', async () => {
    const onSubmitMinutes = vi.fn().mockResolvedValue(true);
    render(<TimerChip endsAt="2026-07-15T10:05:00.000Z" isEditable onSubmitMinutes={onSubmitMinutes} />);

    fireEvent.click(screen.getByRole('button', { name: 'Modifier le temps restant' }));

    const input = screen.getByLabelText('Nouvelle durée en minutes');
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Le composant ne modifie rien localement : il délègue au backend.
    expect(onSubmitMinutes).toHaveBeenCalledWith(10);
  });

  it('ignore une saisie hors bornes sans appeler le backend', () => {
    const onSubmitMinutes = vi.fn();
    render(<TimerChip endsAt="2026-07-15T10:05:00.000Z" isEditable onSubmitMinutes={onSubmitMinutes} />);

    fireEvent.click(screen.getByRole('button', { name: 'Modifier le temps restant' }));

    const input = screen.getByLabelText('Nouvelle durée en minutes');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSubmitMinutes).not.toHaveBeenCalled();
    // Retour à l'affichage normal du compteur.
    expect(screen.getByText('05:00')).toBeTruthy();
  });
});
