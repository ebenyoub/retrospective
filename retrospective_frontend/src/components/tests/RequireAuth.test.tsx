import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from '../RequireAuth';
import { AuthContext } from '@/context/auth/useAuth';
import type { AuthContextType } from '@/context/auth/types/auth.types';

const renderWithAuth = (isAuthenticated: boolean) => {
  const value = { isAuthenticated } as AuthContextType;

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <p>Page privée</p>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<p>Page de connexion</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('RequireAuth', () => {
  it('affiche la page privée si l’utilisateur est connecté', () => {
    renderWithAuth(true);

    expect(screen.getByText('Page privée')).toBeTruthy();
  });

  it('redirige vers /login si l’utilisateur n’est pas connecté', () => {
    renderWithAuth(false);

    expect(screen.queryByText('Page privée')).toBeNull();
    expect(screen.getByText('Page de connexion')).toBeTruthy();
  });
});
