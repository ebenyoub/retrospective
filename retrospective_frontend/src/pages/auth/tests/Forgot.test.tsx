import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Forgot from '../Forgot';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const { mockForgotApi, mockVerifyCodeApi, mockResetPasswordApi } = vi.hoisted(() => ({
  mockForgotApi: vi.fn(),
  mockVerifyCodeApi: vi.fn(),
  mockResetPasswordApi: vi.fn(),
}));

vi.mock('@/pages/auth/services/authApi', () => ({
  forgotApi: mockForgotApi,
  verifyCodeApi: mockVerifyCodeApi,
  resetPasswordApi: mockResetPasswordApi,
}));

const renderForgot = () => {
  render(
    <MemoryRouter>
      <Forgot />
    </MemoryRouter>
  );
};

const goToCodeStep = async () => {
  mockForgotApi.mockResolvedValueOnce({ ok: true, data: undefined });
  fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'test@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Recevoir un code' }));
  await screen.findByText('Code de vérification');
};

const goToPasswordStep = async () => {
  await goToCodeStep();
  mockVerifyCodeApi.mockResolvedValueOnce({ ok: true, data: undefined });
  fireEvent.change(screen.getByLabelText('Code à 4 chiffres'), { target: { value: '1234' } });
  fireEvent.click(screen.getByRole('button', { name: 'Valider le code' }));
  await screen.findByRole('heading', { name: 'Nouveau mot de passe' });
};

describe('Forgot', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockForgotApi.mockReset();
    mockVerifyCodeApi.mockReset();
    mockResetPasswordApi.mockReset();
  });

  describe('Étape EMAIL', () => {
    it('affiche une erreur de format et ne soumet pas si l\'email est invalide', async () => {
      renderForgot();

      fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'pas-un-email' } });
      fireEvent.click(screen.getByRole('button', { name: 'Recevoir un code' }));

      expect(await screen.findByText('Veuillez entrer un email valide.')).toBeTruthy();
      expect(mockForgotApi).not.toHaveBeenCalled();
    });

    it('passe à l\'étape CODE si forgotApi réussit', async () => {
      renderForgot();
      await goToCodeStep();

      expect(mockForgotApi).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText('test@example.com')).toBeTruthy();
    });

    it('affiche un message global et reste sur EMAIL si forgotApi échoue', async () => {
      mockForgotApi.mockResolvedValueOnce({ ok: false, payload: { message: 'Cet email n\'existe pas' } });
      renderForgot();

      fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'inconnu@test.com' } });
      fireEvent.click(screen.getByRole('button', { name: 'Recevoir un code' }));

      expect(await screen.findByText('Cet email n\'existe pas')).toBeTruthy();
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByText('Récupération du mot de passe')).toBeTruthy();
    });
  });

  describe('Étape CODE', () => {
    it('affiche une erreur si le code ne fait pas 4 caractères, sans appeler verifyCodeApi', async () => {
      renderForgot();
      await goToCodeStep();

      fireEvent.change(screen.getByLabelText('Code à 4 chiffres'), { target: { value: '123' } });
      fireEvent.click(screen.getByRole('button', { name: 'Valider le code' }));

      expect(await screen.findByText('Le code doit contenir 4 chiffres exactement')).toBeTruthy();
      expect(mockVerifyCodeApi).not.toHaveBeenCalled();
    });

    it('accepte un code de 4 caractères non numériques (seule la longueur est vérifiée, comme avant la migration)', async () => {
      mockVerifyCodeApi.mockResolvedValueOnce({ ok: true, data: undefined });
      renderForgot();
      await goToCodeStep();

      fireEvent.change(screen.getByLabelText('Code à 4 chiffres'), { target: { value: 'abcd' } });
      fireEvent.click(screen.getByRole('button', { name: 'Valider le code' }));

      await screen.findByRole('heading', { name: 'Nouveau mot de passe' });
      expect(mockVerifyCodeApi).toHaveBeenCalledWith('test@example.com', 'abcd');
    });

    it('revient à l\'étape EMAIL via "Ce n\'est pas le bon email ?"', async () => {
      renderForgot();
      await goToCodeStep();

      fireEvent.click(screen.getByText('Ce n\'est pas le bon email ?'));

      expect(await screen.findByText('Récupération du mot de passe')).toBeTruthy();
    });
  });

  describe('Étape NEW_PASSWORD', () => {
    it('affiche uniquement le message global de non-correspondance quand les mots de passe diffèrent, même si le premier est trop court (aucune erreur de champ)', async () => {
      renderForgot();
      await goToPasswordStep();

      fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'abc' } });
      fireEvent.change(screen.getByLabelText('Confirmation du nouveau mot de passe'), { target: { value: 'autrechose' } });
      fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

      expect(await screen.findByText('Les mots de passe ne sont pas identiques')).toBeTruthy();
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.queryByText('8 caractères minimum.')).toBeNull();
      expect(mockResetPasswordApi).not.toHaveBeenCalled();
    });

    it('affiche les erreurs de champ quand les deux mots de passe sont vides (égaux, donc pas de message de non-correspondance)', async () => {
      renderForgot();
      await goToPasswordStep();

      fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

      expect(await screen.findAllByText('Veuillez remplir tous les champs.')).toHaveLength(2);
      expect(screen.queryByRole('alert')).toBeNull();
      expect(mockResetPasswordApi).not.toHaveBeenCalled();
    });

    it('soumet et redirige vers /login quand les mots de passe correspondent', async () => {
      mockResetPasswordApi.mockResolvedValueOnce({ ok: true, data: undefined });
      renderForgot();
      await goToPasswordStep();

      fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirmation du nouveau mot de passe'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

      await vi.waitFor(() => expect(mockResetPasswordApi).toHaveBeenCalledWith('test@example.com', 'password123', '1234'));
      await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    });
  });
});
