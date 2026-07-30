import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavLink } from "react-router-dom";
import Button from "@/components/ui/Button";
import { FormField, FormLabel, FormInput } from "@/components/ui/Form";
import RetroFormatDropdown from "@/components/RetroFormatDropdown";
import { useAuth } from "@/context/auth/useAuth";
import type { AuthLoginData } from "@/context/auth/types/auth.types";
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from "@/lib/apiError";
import FieldError from "@/components/ui/FieldError";

import { API_BASE } from "@/lib/api";
import { DEFAULT_RETRO_FORMAT_ID, getRetroFormatById } from "@/lib/retroFormats";
import type { CreateAccountFormProps } from "./types/CreateAccountForm.types";

const createAccountSchema = z
  .object({
    prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
    nom: z.string().trim().min(1, "Le nom est obligatoire."),
    email: z.string().trim().min(1, "L'email est obligatoire.").email("L'adresse email n'est pas valide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string().min(1, "La confirmation est obligatoire."),
    retroName: z.string().trim().min(3, "Le nom de la rétrospective doit contenir au moins 3 caractères."),
    formatId: z.string().min(1, "Le format est requis."),
    stepDurationMinutes: z.number({ error: "La durée des étapes est requise." })
      .int("La durée doit être un nombre entier de minutes.")
      .min(1, "La durée doit être d'au moins 1 minute.")
      .max(120, "La durée ne peut pas dépasser 120 minutes."),
    col1: z.string().trim().min(1, "Colonne 1 requise.").optional(),
    col2: z.string().trim().min(1, "Colonne 2 requise.").optional(),
    col3: z.string().trim().min(1, "Colonne 3 requise.").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

type CreateAccountValues = z.infer<typeof createAccountSchema>;

const CreateAccountForm = ({ onSessionCreated }: CreateAccountFormProps) => {
  const { login } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
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
      formatId: DEFAULT_RETRO_FORMAT_ID,
      stepDurationMinutes: 5,
      col1: "Colonne 1",
      col2: "Colonne 2",
      col3: "Colonne 3",
    },
  });

  const formatId = watch("formatId");

  const onSubmit = async (values: CreateAccountValues) => {
    const selectedFormat = getRetroFormatById(values.formatId);
    let formatName = selectedFormat.name;
    let formatColumns = selectedFormat.columns;

    if (values.formatId === "custom-3-columns") {
      formatColumns = [
        values.col1?.trim() || "Colonne 1",
        values.col2?.trim() || "Colonne 2",
        values.col3?.trim() || "Colonne 3",
      ];
      formatName = formatColumns.join(" / ");
    }

    try {
      const username = `${values.prenom.trim()} ${values.nom.trim()}`;
      const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        credentials: "include",
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

      login({ ...signupData.data, email: signupData.data.email ?? values.email.trim() });

      const sessionResponse = await fetch(`${API_BASE}/session/create-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.retroName.trim(),
          formatName,
          formatColumns,
          stepDurationMinutes: values.stepDurationMinutes,
        }),
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
        <FormField>
          <FormLabel htmlFor="prenom">Prénom</FormLabel>
          <FormInput
            id="prenom"
            disabled={isSubmitting}
            aria-invalid={!!errors.prenom}
            aria-describedby={errors.prenom ? "prenom-error" : undefined}
            {...register("prenom")}
          />
          <FieldError id="prenom-error" message={errors.prenom?.message} />
        </FormField>

        <FormField>
          <FormLabel htmlFor="nom">Nom</FormLabel>
          <FormInput
            id="nom"
            disabled={isSubmitting}
            aria-invalid={!!errors.nom}
            aria-describedby={errors.nom ? "nom-error" : undefined}
            {...register("nom")}
          />
          <FieldError id="nom-error" message={errors.nom?.message} />
        </FormField>
      </div>

      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInput
          id="email"
          type="email"
          placeholder="retro@exemple.com"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </FormField>

      <FormField>
        <FormLabel htmlFor="password">Mot de passe</FormLabel>
        <FormInput
          id="password"
          type="password"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </FormField>

      <FormField>
        <FormLabel htmlFor="confirmPassword">Confirmation du mot de passe</FormLabel>
        <FormInput
          id="confirmPassword"
          type="password"
          disabled={isSubmitting}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
          {...register("confirmPassword")}
        />
        <FieldError id="confirmPassword-error" message={errors.confirmPassword?.message} />
      </FormField>

      <FormField>
        <FormLabel htmlFor="retroName">Nom de la rétro</FormLabel>
        <FormInput
          id="retroName"
          disabled={isSubmitting}
          aria-invalid={!!errors.retroName}
          aria-describedby={errors.retroName ? "retroName-error" : undefined}
          {...register("retroName")}
        />
        <FieldError id="retroName-error" message={errors.retroName?.message} />
      </FormField>

      <FormField>
        <FormLabel htmlFor="formatId">Format de rétro</FormLabel>
        <Controller
          name="formatId"
          control={control}
          render={({ field }) => (
            <RetroFormatDropdown
              id="formatId"
              value={field.value ?? ""}
              onChange={field.onChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.formatId}
              aria-describedby={errors.formatId ? "formatId-error" : undefined}
            />
          )}
        />
        <FieldError id="formatId-error" message={errors.formatId?.message} />
      </FormField>

      {formatId === "custom-3-columns" && (
        <div className="grid grid-cols-3 gap-2">
          <FormField>
            <FormLabel htmlFor="col1">Col. 1</FormLabel>
            <FormInput
              id="col1"
              disabled={isSubmitting}
              aria-invalid={!!errors.col1}
              aria-describedby={errors.col1 ? "col1-error" : undefined}
              {...register("col1")}
            />
            <FieldError id="col1-error" message={errors.col1?.message} />
          </FormField>
          <FormField>
            <FormLabel htmlFor="col2">Col. 2</FormLabel>
            <FormInput
              id="col2"
              disabled={isSubmitting}
              aria-invalid={!!errors.col2}
              aria-describedby={errors.col2 ? "col2-error" : undefined}
              {...register("col2")}
            />
            <FieldError id="col2-error" message={errors.col2?.message} />
          </FormField>
          <FormField>
            <FormLabel htmlFor="col3">Col. 3</FormLabel>
            <FormInput
              id="col3"
              disabled={isSubmitting}
              aria-invalid={!!errors.col3}
              aria-describedby={errors.col3 ? "col3-error" : undefined}
              {...register("col3")}
            />
            <FieldError id="col3-error" message={errors.col3?.message} />
          </FormField>
        </div>
      )}

      <FormField>
        <FormLabel htmlFor="stepDurationMinutes">Durée des étapes (minutes)</FormLabel>
        <FormInput
          id="stepDurationMinutes"
          type="number"
          min={1}
          max={120}
          disabled={isSubmitting}
          aria-invalid={!!errors.stepDurationMinutes}
          aria-describedby={errors.stepDurationMinutes ? "stepDurationMinutes-error" : undefined}
          {...register("stepDurationMinutes", { valueAsNumber: true })}
        />
        <FieldError id="stepDurationMinutes-error" message={errors.stepDurationMinutes?.message} />
      </FormField>

      <div className="pt-1">
        <Button unstyled type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
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
