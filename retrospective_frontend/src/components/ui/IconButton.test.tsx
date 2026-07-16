import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import IconButton from './IconButton';

describe('IconButton', () => {
  it('exige un nom accessible et utilise le type button par défaut', () => {
    render(<IconButton aria-label="Fermer">×</IconButton>);

    const button = screen.getByRole('button', { name: 'Fermer' }) as HTMLButtonElement;
    expect(button.type).toBe('button');
  });

  it('applique la variante danger et transmet disabled', () => {
    render(<IconButton aria-label="Supprimer" variant="danger" disabled>×</IconButton>);

    const button = screen.getByRole('button', { name: 'Supprimer' }) as HTMLButtonElement;
    expect(button.className).toContain('border-red-500/20');
    expect(button.disabled).toBe(true);
  });
});
