import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Input } from './FormContainer';

describe('Input (type="password")', () => {
  it("place le champ avant le bouton œil dans le DOM (ordre de tabulation naturel)", () => {
    const { container } = render(<Input type="password" value="" onChange={() => {}} />);

    const focusable = Array.from(container.querySelectorAll('input, button'));
    expect(focusable[0].tagName).toBe('INPUT');
    expect(focusable[1].tagName).toBe('BUTTON');
  });

  it("n'affiche aucun caractère factice quand le champ est vide (pas de placeholder de points)", () => {
    const { container } = render(<Input type="password" value="" onChange={() => {}} />);

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('');
  });
});
