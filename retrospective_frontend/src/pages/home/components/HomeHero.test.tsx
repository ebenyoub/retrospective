import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomeHero from './HomeHero';

describe('HomeHero', () => {
  it("n'affiche plus le badge fictif de participants connectés", () => {
    render(<HomeHero />);

    expect(screen.queryByText(/participants connectés/i)).toBeNull();
  });

  it('affiche toujours le titre et la description', () => {
    render(<HomeHero />);

    expect(screen.getByText('Rétrospective collaborative')).toBeTruthy();
  });
});
