import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('affiche une icône, un titre et une description', () => {
    render(
      <EmptyState
        icon={<span aria-label="Boîte vide">□</span>}
        title="Aucun élément"
        description="Les éléments apparaîtront ici."
      />
    );

    expect(screen.getByLabelText('Boîte vide')).toBeTruthy();
    expect(screen.getByText('Aucun élément')).toBeTruthy();
    expect(screen.getByText('Les éléments apparaîtront ici.')).toBeTruthy();
  });

  it('n’affiche pas de description lorsqu’elle est absente', () => {
    render(<EmptyState icon="□" title="Aucun élément" variant="panel" />);

    expect(screen.getByText('Aucun élément')).toBeTruthy();
    expect(screen.queryByText('Les éléments apparaîtront ici.')).toBeNull();
  });
});
