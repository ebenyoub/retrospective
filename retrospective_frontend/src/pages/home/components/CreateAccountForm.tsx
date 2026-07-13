import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavLink } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/FormContainer";
import { useAuth, type AuthLoginData } from "@/context/auth/useAuth";
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from "@/lib/apiError";
import FieldError from "@/components/ui/FieldError";

import { API_BASE } from "@/lib/api";

const createAccountSchema = z
  .object({
    prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
    nom: z.string().trim().min(1, "Le nom est obligatoire."),
    email: z.string().trim().min(1, "L'email est obligatoire.").email("L'adresse email n'est pas valide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string().min(1, "La confirmation est obligatoire."),
    retroName: z.string().trim().min(3, "Le nom de la rétrospective doit contenir au moins 3 caractères."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

type CreateAccountValues = z.infer<typeof createAccountSchema>;

interface CreateAccountFormProps {
  onSessionCreated: (sessionId: number) => void;
}

// Visiteur non connecté : compte + première rétrospective en un seul envoi.
const CreateAccountForm = ({ onSessionCreated }: CreateAccountFormProps) => {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      password: "",
      confirmPassword: "",
      retroName: "",
    },
  });

  const onSubmit = async (values: CreateAccountValues) => {
    try {
      const username = `${values.prenom.trim()} ${values.nom.trim()}`;
      const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: values.email.trim(), password: values.password }),
      });
      const signupData = await readJsonSafely(signupResponse);

      if (!signupResponse.ok || !isApiSuccess<AuthLoginData>(signupData)) {
        if (signupResponse.status === 409) {
          setError("email", { message: getApiErrorMessage(signupData, "Cet email est déjà utilisé.") });
        } else {
          setError("root", { message: getApiErrorMessage(signupData, "Impossible de créer le compte.") });
        }
        return;
      }

      // Le contexte n'est pas encore à jour de façon synchrone juste après
      // login() : on utilise le token reçu directement pour l'appel suivant.
      login({ ...signupData.data, email: signupData.data.email ?? values.email.trim() });

      const sessionResponse = await fetch(`${API_BASE}/session/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${signupData.data.token}`,
        },
        body: JSON.stringify({ name: values.retroName.trim() }),
      });
      const sessionData = await readJsonSafely(sessionResponse);

      if (!sessionResponse.ok || !isApiSuccess<{ sessionId: number }>(sessionData)) {
        setError("retroName", {
          message: getApiErrorMessage(sessionData, "Compte créé, mais impossible de créer la rétrospective."),
        });
        return;
      }

      onSessionCreated(sessionData.data.sessionId);
    } catch (error) {
      console.error(error);
      setError("root", { message: NETWORK_ERROR_MESSAGE });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate aria-busy={isSubmitting}>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prenom" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Prénom
          </label>
          <Input
            id="prenom"
            disabled={isSubmitting}
            aria-invalid={!!errors.prenom}
            aria-describedby={errors.prenom ? "prenom-error" : undefined}
            {...register("prenom")}
          />
          <FieldError id="prenom-error" message={errors.prenom?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nom" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Nom
          </label>
          <Input
            id="nom"
            disabled={isSubmitting}
            aria-invalid={!!errors.nom}
            aria-describedby={errors.nom ? "nom-error" : undefined}
            {...register("nom")}
          />
          <FieldError id="nom-error" message={errors.nom?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="retro@exemple.com"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Mot de passe
        </label>
        <Input
          id="password"
          type="password"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Confirmation du mot de passe
        </label>
        <Input
          id="confirmPassword"
          type="password"
          disabled={isSubmitting}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
          {...register("confirmPassword")}
        />
        <FieldError id="confirmPassword-error" message={errors.confirmPassword?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="retroName" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Nom de la rétro
        </label>
        <Input
          id="retroName"
          disabled={isSubmitting}
          aria-invalid={!!errors.retroName}
          aria-describedby={errors.retroName ? "retroName-error" : undefined}
          {...register("retroName")}
        />
        <FieldError id="retroName-error" message={errors.retroName?.message} />
      </div>

      <div className="pt-1">
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer et lancer"}
        </Button>
      </div>

      <FieldError id="create-account-error" message={errors.root?.message} />

      <NavLink to="/login" className="text-blue-400 hover:underline text-center text-sm">
        Déjà un compte ? Se connecter
      </NavLink>
    </form>
  );
};

export default CreateAccountForm;
