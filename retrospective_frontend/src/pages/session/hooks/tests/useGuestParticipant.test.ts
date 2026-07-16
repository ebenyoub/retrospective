import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuestParticipant } from '../useGuestParticipant';

describe('useGuestParticipant', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("ne renvoie aucune identité si rien n'est stocké", () => {
    const { result } = renderHook(() => useGuestParticipant('42'));

    expect(result.current.identity).toBeNull();
  });

  it('enregistre puis relit une identité depuis localStorage (pas de doublon au refresh)', () => {
    const { result, unmount } = renderHook(() => useGuestParticipant('42'));

    act(() => {
      result.current.setIdentity({ participantId: 7, guestToken: 'tok-abc', displayName: 'EBNoob' });
    });

    expect(result.current.identity).toEqual({ participantId: 7, guestToken: 'tok-abc', displayName: 'EBNoob' });

    // Simule un refresh : nouveau montage du hook pour la même session.
    unmount();
    const { result: afterRefresh } = renderHook(() => useGuestParticipant('42'));
    expect(afterRefresh.current.identity).toEqual({ participantId: 7, guestToken: 'tok-abc', displayName: 'EBNoob' });
  });

  it('isole les identités par session', () => {
    const { result: sessionA } = renderHook(() => useGuestParticipant('1'));
    const { result: sessionB } = renderHook(() => useGuestParticipant('2'));

    act(() => {
      sessionA.current.setIdentity({ participantId: 1, guestToken: 'tok-a', displayName: 'A' });
    });

    expect(sessionA.current.identity?.displayName).toBe('A');
    expect(sessionB.current.identity).toBeNull();
  });

  it('efface une identité stockée', () => {
    const { result } = renderHook(() => useGuestParticipant('42'));

    act(() => {
      result.current.setIdentity({ participantId: 7, guestToken: 'tok-abc', displayName: 'EBNoob' });
    });
    act(() => {
      result.current.clearIdentity();
    });

    expect(result.current.identity).toBeNull();
    expect(localStorage.getItem('retro:guest:42')).toBeNull();
  });
});
