import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FormContainer, { FormTitle } from "@/components/ui/FormContainer";
import FormField from "@/components/ui/FormField";
import SpinContainer from "@/components/ui/SpinContainer";
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from "@/lib/apiError";
import React, { useState, type ChangeEvent } from "react";
import { useNavigate, NavLink } from "react-router-dom";

type Step = 'EMAIL' | 'CODE' | 'NEW_PASSWORD';

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
      const response = await fetch("http://localhost:8000/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        setStep('CODE');
      } else {
        setGlobalError(getApiErrorMessage(data, "Impossible d'envoyer le code."));
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
      const response = await fetch("http://localhost:8000/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        setStep('NEW_PASSWORD');
      } else {
        setGlobalError(getApiErrorMessage(data, "Code invalide."));
      }
    } catch (err) {
      console.log(err);
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

      const response = await fetch("http://localhost:8000/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, code })
      })

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess(data)) {
        console.log("Mot de passe modifié avec succès !");
        navigate("/login");
      } else {
        setGlobalError(getApiErrorMessage(data, "Erreur lors du changement de mot de passe."));
      }
    } catch (error) {
      console.log(error);
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
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded text-center text-sm">
            {globalError}
          </div>
        )}

        {/* --- FORMULAIRE 1 : EMAIL --- */}
        {step === 'EMAIL' && (
          <FormContainer onSubmit={handleEmailSubmit}>
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
          </FormContainer>
        )}

        {/* --- FORMULAIRE 2 : CODE --- */}
        {step === 'CODE' && (
          <FormContainer onSubmit={handleCodeSubmit}>
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
          </FormContainer>
        )}

        {/* --- FORMULAIRE 3 : NOUVEAU PASSWORD (Placeholder) --- */}
        {step === 'NEW_PASSWORD' && (
          <FormContainer onSubmit={handlePasswordSubmit}>
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
          </FormContainer>
        )}

      </SpinContainer>
    </Container>
  );
};

export default Forgot;
