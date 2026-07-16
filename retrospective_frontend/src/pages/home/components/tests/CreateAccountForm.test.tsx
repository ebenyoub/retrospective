import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@/context/toast/ToastContext';
import CreateAccountForm from '../CreateAccountForm';

const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }));

vi.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const jsonResponse = (body: unknown, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => body,
});

const renderForm = (onSessionCreated = vi.fn()) => {
  render(
    <MemoryRouter>
      <ToastProvider>
        <CreateAccountForm onSessionCreated={onSessionCreated} />
      </ToastProvider>
    </MemoryRouter>
  );
  return onSessionCreated;
};

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Elyas' } });
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Benyoub' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'e@test.com' } });
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
  fireEvent.change(screen.getByLabelText('Confirmation du mot de passe'), { target: { value: 'password123' } });
  fireEvent.change(screen.getByLabelText('Nom de la rétro'), { target: { value: 'Sprint 43' } });
};

describe('CreateAccountForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("n'affiche aucun placeholder avec un nom réel pour Prénom et Nom", () => {
    renderForm();

    const prenomInput = screen.getByLabelText('Prénom') as HTMLInputElement;
    const nomInput = screen.getByLabelText('Nom') as HTMLInputElement;

    expect(prenomInput.placeholder).toBe('');
    expect(nomInput.placeholder).toBe('');
    expect(screen.queryByPlaceholderText('Elyas')).toBeNull();
    expect(screen.queryByPlaceholderText('Benyoub')).toBeNull();
  });

  it('affiche un placeholder neutre pour Email', () => {
    renderForm();

    expect((screen.getByLabelText('Email') as HTMLInputElement).placeholder).toBe('retro@exemple.com');
  });

  it('affiche les erreurs de champ sous chaque champ sans toast, sans soumettre', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Créer et lancer' }));

    expect(await screen.findByText('Le prénom est obligatoire.')).toBeTruthy();
    expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
    expect(screen.getByText("L'email est obligatoire.")).toBeTruthy();
    expect(screen.getByText('Le mot de passe doit contenir au moins 8 caractères.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    expect(emailInput.getAttribute('aria-describedby')).toBe('email-error');
  });

  it('affiche une erreur de confirmation si les mots de passe diffèrent', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Elyas' } });
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Benyoub' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'e@test.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmation du mot de passe'), { target: { value: 'autrechose' } });
    fireEvent.change(screen.getByLabelText('Nom de la rétro'), { target: { value: 'Sprint 43' } });

    fireEvent.click(screen.getByRole('button', { name: 'Créer et lancer' }));

    expect(await screen.findByText('Les mots de passe ne correspondent pas.')).toBeTruthy();
  });

  it('crée le compte puis la session et transmet le sessionId au succès', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { token: 'new-token', userId: 1, username: 'Elyas Benyoub' } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { sessionId: 42 } }));
    vi.stubGlobal('fetch', fetchMock);

    const onSessionCreated = renderForm();
    fillValidForm();
    fireEvent.change(screen.getByLabelText('Format de rétro'), { target: { value: 'went-well-improve-next-actions' } });

    fireEvent.click(screen.getByRole('button', { name: 'Créer et lancer' }));

    await vi.waitFor(() => expect(onSessionCreated).toHaveBeenCalledWith(42));
    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ token: 'new-token', userId: 1 }));
    expect(JSON.parse(String(fetchMock.mock.calls[1][1].body))).toEqual({
      name: 'Sprint 43',
      formatName: 'Bien passé / À améliorer / Prochaines actions',
      formatColumns: ['Bien passé', 'À améliorer', 'Prochaines actions'],
      stepDurationMinutes: 5,
    });
  });

  it('affiche uniquement les 6 formats MVP validés', () => {
    renderForm();

    expect(Array.from(screen.getByLabelText('Format de rétro').querySelectorAll('option')).map((option) => option.textContent)).toEqual([
      'Commencer / Arrêter / Continuer',
      'Points positifs / Points négatifs / Actions',
      'Succès / Difficultés / Idées',
      "J'ai aimé / J'ai moins aimé / Propositions",
      'Conserver / Améliorer / Innover',
      'Bien passé / À améliorer / Prochaines actions',
    ]);
  });

  it("affiche l'erreur sous le champ email si le compte existe déjà (conflit métier, pas de toast)", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({ success: false, message: 'Ce pseudo ou cet email est déjà utilisé.' }, false, 409)
    );
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Créer et lancer' }));

    expect(await screen.findByText('Ce pseudo ou cet email est déjà utilisé.')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
