import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import Drawer from './Drawer';

const DrawerHarness = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Ouvrir</button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="drawer-title"
        overlayLabel="Fermer le panneau"
      >
        <h2 id="drawer-title">Panneau</h2>
        <button type="button">Première action</button>
        <button type="button">Dernière action</button>
      </Drawer>
    </>
  );
};

describe('Drawer', () => {
  it('gère l’ouverture, Échap et la restauration du focus', () => {
    render(<DrawerHarness />);

    const trigger = screen.getByRole('button', { name: 'Ouvrir' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Panneau' });
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Panneau' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('ferme le panneau au clic sur l’overlay', () => {
    render(<DrawerHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le panneau' }));

    expect(screen.queryByRole('dialog', { name: 'Panneau' })).toBeNull();
  });

  it('maintient la tabulation dans le panneau', () => {
    render(<DrawerHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir' }));
    const firstAction = screen.getByRole('button', { name: 'Première action' });
    const lastAction = screen.getByRole('button', { name: 'Dernière action' });

    lastAction.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(firstAction);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastAction);
  });

  it('applique le placement bas sans largeur desktop', () => {
    render(
      <Drawer
        open
        onClose={() => undefined}
        labelledBy="bottom-title"
        overlayLabel="Fermer"
        side="bottom"
        size="sm"
      >
        <h2 id="bottom-title">Panneau mobile</h2>
      </Drawer>
    );

    const dialog = screen.getByRole('dialog', { name: 'Panneau mobile' });
    expect(dialog.className).toContain('bottom-0');
    expect(dialog.className).not.toContain('w-[280px]');
  });
});
