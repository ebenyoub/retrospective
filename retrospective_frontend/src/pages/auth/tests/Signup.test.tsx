import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@/context/toast/ToastContext';
import Signup from '../Signup';

const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }));

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const { mockSignupApi } = vi.hoisted(() => ({ mockSignupApi: vi.fn() }));

vi.mock('@/pages/auth/services/authApi', () => ({
  signupApi: mockSignupApi,
}));

const renderSignup = () => {
  render(
    <MemoryRouter>
      <ToastProvider>
        <Signup />
      </ToastProvider>
    </MemoryRouter>
  );
};

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('Pseudonyme (Nom d\'utilisateur)'), { target: { value: 'Minerva' } });
  fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'minerva@test.com' } });
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
};

describe('Signup', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockSignupApi.mockReset();
  });

  it('affiche une erreur de confirmation sous le champ confirm si les mots de passe diffèrent, sans soumettre', async () => {
    renderSignup();

    fillValidForm();
    fireEvent.change(screen.getByLabelText('Confirmation du mot de passe'), { target: { value: 'autrechose' } });
    fireEvent.blur(screen.getByLabelText('Confirmation du mot de passe'));

    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(await screen.findByText('Les mots de passe ne correspondent pas.')).toBeTruthy();
    expect(mockSignupApi).not.toHaveBeenCalled();
  });

  it("n'affiche aucune erreur de confirmation sous le champ password lui-même quand les mots de passe diffèrent", async () => {
    renderSignup();

    fillValidForm();
    fireEvent.change(screen.getByLabelText('Confirmation du mot de passe'), { target: { value: 'autrechose' } });

    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await screen.findByText('Les mots de passe ne correspondent pas.');

    const passwordInput = screen.getByLabelText('Mot de passe');
    expect(passwordInput.getAttribute('aria-invalid')).not.toBe('true');
  });

  it('soumet et connecte quand les mots de passe correspondent', async () => {
    mockSignupApi.mockResolvedValueOnce({
      ok: true,
      data: { token: 'new-token', userId: 1, username: 'Minerva', email: 'minerva@test.com' },
    });

    renderSignup();

    fillValidForm();
    fireEvent.change(screen.getByLabelText('Confirmation du mot de passe'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await vi.waitFor(() => expect(mockSignupApi).toHaveBeenCalledWith({
      username: 'Minerva',
      email: 'minerva@test.com',
      password: 'password123',
      confirm: 'password123',
    }));
    await vi.waitFor(() => expect(mockLogin).toHaveBeenCalled());
  });
});
