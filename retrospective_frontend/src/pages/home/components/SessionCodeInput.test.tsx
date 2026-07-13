import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionCodeInput from './SessionCodeInput';

// Composant contrôlé : on encapsule dans un petit wrapper avec state local,
// comme le fait JoinSessionForm via react-hook-form.
const ControlledSessionCodeInput = ({ onFinalChange }: { onFinalChange?: (code: string) => void }) => {
  const [code, setCode] = useState('');

  return (
    <SessionCodeInput
      value={code}
      onChange={(next) => {
        setCode(next);
        onFinalChange?.(next);
      }}
    />
  );
};

describe('SessionCodeInput', () => {
  it('avance automatiquement le focus vers la case suivante après un chiffre', () => {
    render(<ControlledSessionCodeInput />);

    fireEvent.change(screen.getByLabelText('Chiffre 1 du code'), { target: { value: '1' } });

    expect(document.activeElement).toBe(screen.getByLabelText('Chiffre 2 du code'));
  });

  it('revient à la case précédente avec Retour arrière sur une case vide', () => {
    render(<ControlledSessionCodeInput />);

    fireEvent.change(screen.getByLabelText('Chiffre 1 du code'), { target: { value: '1' } });
    fireEvent.keyDown(screen.getByLabelText('Chiffre 2 du code'), { key: 'Backspace' });

    expect(document.activeElement).toBe(screen.getByLabelText('Chiffre 1 du code'));
  });

  it('distribue un code collé sur les 4 cases', () => {
    const onFinalChange = vi.fn();
    render(<ControlledSessionCodeInput onFinalChange={onFinalChange} />);

    const clipboardData = { getData: () => '1234' };
    fireEvent.paste(screen.getByLabelText('Chiffre 1 du code'), { clipboardData });

    expect(onFinalChange).toHaveBeenCalledWith('1234');
    expect((screen.getByLabelText('Chiffre 1 du code') as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText('Chiffre 4 du code') as HTMLInputElement).value).toBe('4');
  });

  it('transmet la valeur finale sous forme de code unique de 4 chiffres', () => {
    const onFinalChange = vi.fn();
    render(<ControlledSessionCodeInput onFinalChange={onFinalChange} />);

    fireEvent.change(screen.getByLabelText('Chiffre 1 du code'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Chiffre 2 du code'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Chiffre 3 du code'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Chiffre 4 du code'), { target: { value: '4' } });

    expect(onFinalChange).toHaveBeenLastCalledWith('1234');
  });
});
