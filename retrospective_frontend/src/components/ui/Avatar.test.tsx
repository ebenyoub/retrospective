import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Avatar from './Avatar';

describe('Avatar', () => {
  it('conserve les initiales, la couleur par identifiant et la taille des cartes', () => {
    render(<Avatar name="Jean Dupont" colorSeed={1} fallback="P" />);

    const avatar = screen.getByText('JD');
    expect(avatar.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.style.width).toBe('18px');
    expect(avatar.style.height).toBe('18px');
    expect(avatar.style.fontSize).toBe('8.1px');
    expect(avatar.style.backgroundColor).toBe('rgb(239, 68, 68)');
  });

  it('conserve la couleur par nom et accepte une taille de participant', () => {
    render(<Avatar name="Alice" colorSeed="Alice" size={32} fontSize={12} />);

    const avatar = screen.getByText('A');
    expect(avatar.style.width).toBe('32px');
    expect(avatar.style.fontSize).toBe('12px');
    expect(avatar.style.backgroundColor).toBe('rgb(59, 130, 246)');
  });

  it('utilise les initiales de repli pour un nom vide', () => {
    render(<Avatar name="" colorSeed={0} fallback="P" />);

    expect(screen.getByText('P')).toBeTruthy();
  });
});
