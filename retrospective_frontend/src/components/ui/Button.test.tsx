import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('expose les classes cursor-pointer, hover, focus visible et disabled', () => {
    render(<Button variant="primary">Valider</Button>);
    const button = screen.getByRole('button', { name: 'Valider' });

    expect(button.className).toContain('cursor-pointer');
    expect(button.className).toContain('hover:bg-slate-200');
    expect(button.className).toContain('focus-visible:ring-2');
    expect(button.className).toContain('disabled:opacity-50');
    expect(button.className).toContain('disabled:cursor-not-allowed');
  });

  it('applique disabled au bouton quand la prop disabled est passée', () => {
    render(<Button disabled>Valider</Button>);

    const button = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('est un vrai type="submit" quand demandé', () => {
    render(<Button type="submit">Valider</Button>);

    const button = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement;
    expect(button.type).toBe('submit');
  });

  it('fusionne les classes personnalisées avec la variante', () => {
    render(<Button variant="primary" className="w-full">Valider</Button>);

    const button = screen.getByRole('button', { name: 'Valider' });
    expect(button.className).toContain('bg-slate-50');
    expect(button.className).toContain('w-full');
  });

  it('préserve une apparence entièrement personnalisée avec unstyled', () => {
    render(<Button unstyled className="custom-button">Valider</Button>);

    expect(screen.getByRole('button', { name: 'Valider' }).className).toBe('custom-button');
  });
});
