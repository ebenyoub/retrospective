import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FormContainer, { FormGroup, FormTitle, Input } from "@/components/ui/FormContainer";
import SpinContainer from "@/components/ui/SpinContainer";
import React, { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

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

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('CODE');
      } else {
        setGlobalError(data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      setGlobalError("Impossible de contacter le serveur.");
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

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('NEW_PASSWORD');
      } else {
        setGlobalError(data.message || "Code invalide.");
      }
    } catch (err) {
      console.log(err);
      setGlobalError("Erreur de connexion.");
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

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Mot de passe modifié avec succès !");
        navigate("/login");
      } else {
        setGlobalError(data.message || "Erreur lors du changement de mot de passe.");
      }
    } catch (error) {
      console.log(error);
      setGlobalError("Erreur de connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  }


  // --- RENDER ---
  return (
    <Container className="flex justify-center items-center min-h-[60vh]">
      <SpinContainer onSpin={isLoading}>

        {globalError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded text-center text-sm">
            {globalError}
          </div>
        )}

        {/* --- FORMULAIRE 1 : EMAIL --- */}
        {step === 'EMAIL' && (
          <FormContainer onSubmit={handleEmailSubmit}>
            <FormTitle>Récupération du mot de passe</FormTitle>
            <FormGroup>
              <label htmlFor="email" className="block text-sm mb-1">Entrez votre email</label>
              <Input
                type="email"
                id="email"
                value={email}
                autoFocus
                disabled={isLoading}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className={inputErrors.email ? "border-red-500" : ""}
              />
              {inputErrors.email && <small className="text-red-400 text-xs mt-1">{inputErrors.email}</small>}
            </FormGroup>
            <Button disabled={isLoading}>
              {isLoading ? "Envoi..." : "Recevoir un code"}
            </Button>
          </FormContainer>
        )}

        {/* --- FORMULAIRE 2 : CODE --- */}
        {step === 'CODE' && (
          <FormContainer onSubmit={handleCodeSubmit}>
            <FormTitle>Code de vérification</FormTitle>
            <p className="text-gray-400 text-sm text-center mb-4">
              Envoyé à : <span className="text-white font-semibold">{email}</span>
            </p>

            <FormGroup>
              <label htmlFor="code" className="block text-sm mb-1">Code à 4 chiffres</label>
              <Input
                type="text"
                inputMode="numeric"
                id="code"
                maxLength={4}
                value={code}
                autoFocus
                disabled={isLoading}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                placeholder="1234"
                className={inputErrors.code ? "border-red-500 text-center tracking-widest text-lg" : "text-center tracking-widest text-lg"}
              />
              {inputErrors.code && <small className="text-red-400 text-xs mt-1">{inputErrors.code}</small>}
            </FormGroup>

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
            <FormGroup>
              <label htmlFor="new-password" className="block text-sm mb-1">Nouveau mot de passe</label>
              <Input
                type="password"
                id="new-password"
                value={newPassword}
                autoComplete="new-password"
                autoFocus
                disabled={isLoading}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                className={inputErrors.newPassword ? "border-red-500" : ""}
              />
              {inputErrors.newPassword && <small className="text-red-400 text-xs mt-1">{inputErrors.newPassword}</small>}
            </FormGroup>
            <FormGroup>
              <label htmlFor="confirm" className="block text-sm mb-1">confirmez le mot de passe</label>
              <Input
                type="password"
                id="confirm"
                value={confirmation}
                autoComplete="confirm"
                disabled={isLoading}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmation(e.target.value)}
                className={inputErrors.confirmation ? "border-red-500" : ""}
              />
              {inputErrors.confirmation && <small className="text-red-400 text-xs mt-1">{inputErrors.confirmation}</small>}
            </FormGroup>
            <Button type="submit" disabled={isLoading}>Modifier</Button>
          </FormContainer>
        )}

      </SpinContainer>
    </Container>
  );
};

export default Forgot;
