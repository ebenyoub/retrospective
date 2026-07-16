import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Form, { FormTitle } from "@/components/ui/Form";
import FormField from "@/components/ui/FormField";
import SpinContainer from "@/components/ui/SpinContainer";
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from "@/lib/apiError";
import React, { useState, type ChangeEvent } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { forgotApi, verifyCodeApi, resetPasswordApi } from "@/pages/auth/services/authApi";
import type { Step } from "@/pages/auth/types/Forgot.types";

const Forgot = () => {
  const [step, setStep] = useState<Step>('EMAIL');

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // --- ENVOI DE L'EMAIL ---
  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInputErrors({});
    setGlobalError("");


    const errors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) errors.email = "Veuillez entrer un email valide.";

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      const result = await forgotApi(email);

      if (result.ok) {
        setStep('CODE');
      } else {
        setGlobalError(getApiErrorMessage(result.payload, "Impossible d'envoyer le code."));
      }
    } catch (err) {
      setGlobalError(NETWORK_ERROR_MESSAGE);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- VÉRIFICATION DU CODE ---
  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInputErrors({});
    setGlobalError("");

    if (code.trim().length !== 4) {
      setInputErrors({ code: "Le code doit contenir 4 chiffres exactement" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyCodeApi(email, code);

      if (result.ok) {
        setStep('NEW_PASSWORD');
      } else {
        setGlobalError(getApiErrorMessage(result.payload, "Code invalide."));
      }
    } catch (err) {
      console.error(err);
      setGlobalError(NETWORK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Étape 3 : MODIFICATION DU MOT DE PASSE ---

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInputErrors({});
    setGlobalError("");

    const errors: { [key: string]: string } = {};

    if (newPassword.length < 8) errors.newPassword = "8 caractères minimum."
    if (!newPassword) errors.newPassword = "Veuillez remplir tous les champs.";
    if (confirmation.length < 8) errors.confirmation = "8 caractères minimum."
    if (!confirmation) errors.confirmation = "Veuillez remplir tous les champs.";
    if (newPassword !== confirmation) {
      setGlobalError("Les mots de passe ne sont pas identiques");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }

    try {
      setIsLoading(true);

      const result = await resetPasswordApi(email, newPassword, code);

      if (result.ok) {
        navigate("/login");
      } else {
        setGlobalError(getApiErrorMessage(result.payload, "Erreur lors du changement de mot de passe."));
      }
    } catch (error) {
      console.error(error);
      setGlobalError(NETWORK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }


  // --- RENDER ---
  return (
    <Container className="flex justify-center items-center min-h-[60vh]">
      <SpinContainer onSpin={isLoading} className="w-full max-w-md">

        {globalError && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded text-center text-sm"
          >
            {globalError}
          </div>
        )}

        {/* --- FORMULAIRE 1 : EMAIL --- */}
        {step === 'EMAIL' && (
          <Form onSubmit={handleEmailSubmit} aria-busy={isLoading}>
            <FormTitle>Récupération du mot de passe</FormTitle>
            <FormField
              id="email"
              label="Adresse e-mail"
              type="text"
              value={email}
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              error={inputErrors.email}
            />
            <Button disabled={isLoading}>
              {isLoading ? "Envoi..." : "Recevoir un code"}
            </Button>

            <div className="flex flex-col gap-2 mt-4 text-center text-sm">
                <NavLink to="/login" className="text-blue-400 hover:underline">
                    Retour à la connexion
                </NavLink>
            </div>
          </Form>
        )}

        {/* --- FORMULAIRE 2 : CODE --- */}
        {step === 'CODE' && (
          <Form onSubmit={handleCodeSubmit} aria-busy={isLoading}>
            <FormTitle>Code de vérification</FormTitle>
            <p className="text-gray-400 text-sm text-center mb-4">
              Envoyé à : <span className="text-white font-semibold">{email}</span>
            </p>

            <FormField
              id="code"
              label="Code à 4 chiffres"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={code}
              autoFocus
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
              placeholder="1234"
              className="text-center tracking-widest text-lg"
              error={inputErrors.code}
            />

            <Button disabled={isLoading}>
              {isLoading ? "Vérification..." : "Valider le code"}
            </Button>

            <button
              type="button"
              onClick={() => { setStep('EMAIL'); setGlobalError(""); }}
              className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline w-full text-center"
            >
              Ce n'est pas le bon email ?
            </button>
          </Form>
        )}

        {/* --- FORMULAIRE 3 : NOUVEAU PASSWORD (Placeholder) --- */}
        {step === 'NEW_PASSWORD' && (
          <Form onSubmit={handlePasswordSubmit} aria-busy={isLoading}>
            <FormTitle>Nouveau mot de passe</FormTitle>
            <FormField
              id="new-password"
              label="Nouveau mot de passe"
              type="password"
              value={newPassword}
              autoComplete="new-password"
              autoFocus
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              error={inputErrors.newPassword}
            />
            <FormField
              id="confirm"
              label="Confirmation du nouveau mot de passe"
              type="password"
              value={confirmation}
              autoComplete="confirm"
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmation(e.target.value)}
              error={inputErrors.confirmation}
            />
            <Button type="submit" disabled={isLoading}>Modifier</Button>
          </Form>
        )}

      </SpinContainer>
    </Container>
  );
};

export default Forgot;
