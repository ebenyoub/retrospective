import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Form, { FormTitle } from "@/components/ui/Form";
import FormField from "@/components/ui/FormField";
import SpinContainer from "@/components/ui/SpinContainer";
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from "@/lib/apiError";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { forgotApi, verifyCodeApi, resetPasswordApi } from "@/pages/auth/services/authApi";
import type { Step } from "@/pages/auth/types/Forgot.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSchema = z.object({
  email: z.string().refine((value) => EMAIL_REGEX.test(value), "Veuillez entrer un email valide."),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const codeSchema = z.object({
  code: z.string().refine((value) => value.trim().length === 4, "Le code doit contenir 4 chiffres exactement"),
});
type CodeFormValues = z.infer<typeof codeSchema>;

interface PasswordFormValues {
  newPassword: string;
  confirmation: string;
}

const Forgot = () => {
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [globalError, setGlobalError] = useState("");
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { newPassword: "", confirmation: "" },
  });

  const isLoading = emailForm.formState.isSubmitting
    || codeForm.formState.isSubmitting
    || passwordForm.formState.isSubmitting;

  // --- ENVOI DE L'EMAIL ---
  const onEmailSubmit = async (values: EmailFormValues) => {
    setGlobalError("");

    try {
      const result = await forgotApi(values.email);

      if (result.ok) {
        setEmail(values.email);
        setStep('CODE');
      } else {
        setGlobalError(getApiErrorMessage(result.payload, "Impossible d'envoyer le code."));
      }
    } catch (err) {
      setGlobalError(NETWORK_ERROR_MESSAGE);
      console.error(err);
    }
  };

  // --- VÉRIFICATION DU CODE ---
  const onCodeSubmit = async (values: CodeFormValues) => {
    setGlobalError("");

    try {
      const result = await verifyCodeApi(email, values.code);

      if (result.ok) {
        setCode(values.code);
        setStep('NEW_PASSWORD');
      } else {
        setGlobalError(getApiErrorMessage(result.payload, "Code invalide."));
      }
    } catch (err) {
      console.error(err);
      setGlobalError(NETWORK_ERROR_MESSAGE);
    }
  };

  // --- Étape 3 : MODIFICATION DU MOT DE PASSE ---
  // Validation manuelle (pas de schéma Zod) : la règle "mots de passe non
  // identiques" doit remplacer entièrement les erreurs de champ (longueur,
  // champs vides) plutôt que coexister avec elles, comportement intentionnel
  // du code d'origine qu'un schéma déclaratif classique ne reproduit pas.
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    passwordForm.clearErrors();
    setGlobalError("");

    const fieldErrors: Partial<Record<keyof PasswordFormValues, string>> = {};

    if (values.newPassword.length < 8) fieldErrors.newPassword = "8 caractères minimum.";
    if (!values.newPassword) fieldErrors.newPassword = "Veuillez remplir tous les champs.";
    if (values.confirmation.length < 8) fieldErrors.confirmation = "8 caractères minimum.";
    if (!values.confirmation) fieldErrors.confirmation = "Veuillez remplir tous les champs.";

    if (values.newPassword !== values.confirmation) {
      setGlobalError("Les mots de passe ne sont pas identiques");
      return;
    }

    if (Object.keys(fieldErrors).length > 0) {
      (Object.keys(fieldErrors) as Array<keyof PasswordFormValues>).forEach((field) => {
        passwordForm.setError(field, { message: fieldErrors[field] });
      });
      return;
    }

    try {
      const result = await resetPasswordApi(email, values.newPassword, code);

      if (result.ok) {
        navigate("/login");
      } else {
        setGlobalError(getApiErrorMessage(result.payload, "Erreur lors du changement de mot de passe."));
      }
    } catch (error) {
      console.error(error);
      setGlobalError(NETWORK_ERROR_MESSAGE);
    }
  };

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
          <Form onSubmit={emailForm.handleSubmit(onEmailSubmit)} aria-busy={isLoading}>
            <FormTitle>Récupération du mot de passe</FormTitle>
            <FormField
              id="email"
              label="Adresse e-mail"
              type="text"
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              placeholder="exemple@email.com"
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register("email")}
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
          <Form onSubmit={codeForm.handleSubmit(onCodeSubmit)} aria-busy={isLoading}>
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
              autoFocus
              disabled={isLoading}
              placeholder="1234"
              className="text-center tracking-widest text-lg"
              error={codeForm.formState.errors.code?.message}
              {...codeForm.register("code")}
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

        {/* --- FORMULAIRE 3 : NOUVEAU PASSWORD --- */}
        {step === 'NEW_PASSWORD' && (
          <Form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} aria-busy={isLoading}>
            <FormTitle>Nouveau mot de passe</FormTitle>
            <FormField
              id="new-password"
              label="Nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              autoFocus
              disabled={isLoading}
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register("newPassword")}
            />
            <FormField
              id="confirm"
              label="Confirmation du nouveau mot de passe"
              type="password"
              autoComplete="confirm"
              disabled={isLoading}
              error={passwordForm.formState.errors.confirmation?.message}
              {...passwordForm.register("confirmation")}
            />
            <Button type="submit" disabled={isLoading}>Modifier</Button>
          </Form>
        )}

      </SpinContainer>
    </Container>
  );
};

export default Forgot;
