import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import useFormValidation from '../useFormValidation';
import type { ValidationSchema } from '../types/useFormValidation.types';

interface LoginValues {
  username: string;
}

const schema: ValidationSchema<LoginValues> = {
  username: [
    (value) => (value.trim() === '' ? 'Le pseudo est requis.' : undefined),
  ],
};

// Fabrique un événement de changement d'input minimal, sans passer par `any`.
const createChangeEvent = (name: string, value: string): ChangeEvent<HTMLInputElement> =>
  ({ target: { name, value } }) as ChangeEvent<HTMLInputElement>;

describe('useFormValidation', () => {
  it('initialise les valeurs sans erreur', () => {
    const { result } = renderHook(() => useFormValidation<LoginValues>({ username: '' }, schema));

    expect(result.current.values.username).toBe('');
    expect(result.current.errors.username).toBeUndefined();
  });

  it('affiche une erreur quand le champ requis est vide', () => {
    const { result } = renderHook(() => useFormValidation<LoginValues>({ username: '' }, schema));

    act(() => {
      result.current.handleInputChange(createChangeEvent('username', ''));
    });

    expect(result.current.errors.username).toBe('Le pseudo est requis.');
  });

  it('valide correctement un champ rempli', () => {
    const { result } = renderHook(() => useFormValidation<LoginValues>({ username: '' }, schema));

    act(() => {
      result.current.handleInputChange(createChangeEvent('username', 'Elyas'));
    });

    expect(result.current.errors.username).toBeUndefined();
    expect(result.current.values.username).toBe('Elyas');
  });

  it('validateAll retourne false si un champ est invalide', () => {
    const { result } = renderHook(() => useFormValidation<LoginValues>({ username: '' }, schema));

    let isValid = true;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.username).toBe('Le pseudo est requis.');
  });
});
