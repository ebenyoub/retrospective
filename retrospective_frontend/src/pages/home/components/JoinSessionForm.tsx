import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/FormContainer";
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from "@/lib/apiError";
import FieldError from "@/components/ui/FieldError";
import SessionCodeInput from "./SessionCodeInput";
import { useAuth } from "@/context/auth/useAuth";

import { API_BASE } from "@/lib/api";
import { pseudoSchema } from "@/lib/pseudoSchema";

const joinConnectedSchema = z.object({
  code: z.string().length(4, "Le code de session est obligatoire."),
  pseudo: z.string().optional(),
});

// Le pseudo suit les mêmes règles que le backend (schéma partagé) : une
// valeur acceptée ici ne peut plus être rejetée par l'API.
const joinGuestSchema = z.object({
  code: z.string().length(4, "Le code de session est obligatoire."),
  pseudo: pseudoSchema,
});

type JoinSessionValues = z.infer<typeof joinGuestSchema>;

interface JoinSessionFormProps {
  onSessionJoined: (sessionId: number) => void;
}

interface GuestJoinData {
  id: number;
  displayName: string;
  guestToken: string;
  sessionId: number;
}

const storeGuestIdentity = (data: GuestJoinData) => {
  localStorage.setItem(
    `retro:guest:${data.sessionId}`,
    JSON.stringify({
      participantId: data.id,
      guestToken: data.guestToken,
      displayName: data.displayName,
    })
  );
};

// Participant avec ou sans compte : s'adapte à l'état d'authentification.
const JoinSessionForm = ({ onSessionJoined }: JoinSessionFormProps) => {
  const [code, setCode] = useState("");
  const { isAuthenticated, token } = useAuth();

  const schema = isAuthenticated ? joinConnectedSchema : joinGuestSchema;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JoinSessionValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", pseudo: "" },
  });

  const onSubmit = async (values: JoinSessionValues) => {
    try {
      if (isAuthenticated) {
        // Utilisateur connecté : rejoint via POST /session/join (avec token JWT, sans pseudo)
        const response = await fetch(`${API_BASE}/session/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: values.code }),
        });
        const data = await readJsonSafely(response);

        if (!response.ok || !isApiSuccess<{ joinId: number; sessionId: number }>(data)) {
          setError("code", { message: getApiErrorMessage(data, "Code de session invalide.") });
          return;
        }

        onSessionJoined(data.data.sessionId);
      } else {
        // Invité : rejoint via POST /session/join-guest (sans token JWT, avec pseudo)
        const response = await fetch(`${API_BASE}/session/join-guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: values.code, pseudo: values.pseudo?.trim() }),
        });
        const data = await readJsonSafely(response);

        if (!response.ok || !isApiSuccess<GuestJoinData>(data)) {
          setError("code", { message: getApiErrorMessage(data, "Code de session invalide.") });
          return;
        }

        storeGuestIdentity(data.data);
        onSessionJoined(data.data.sessionId);
      }
    } catch (error) {
      console.error(error);
      setError("root", { message: NETWORK_ERROR_MESSAGE });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate aria-busy={isSubmitting}>
      <div>
        <span className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
          Code de la session
        </span>
        <SessionCodeInput
          value={code}
          onChange={(next) => {
            setCode(next);
            setValue("code", next, { shouldValidate: Boolean(errors.code) });
          }}
          disabled={isSubmitting}
          hasError={!!errors.code}
          describedBy={errors.code ? "code-error" : undefined}
        />
        <FieldError id="code-error" message={errors.code?.message} />
      </div>

      {!isAuthenticated && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pseudo" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Prénom ou pseudo
          </label>
          <Input
            id="pseudo"
            disabled={isSubmitting}
            aria-invalid={!!errors.pseudo}
            aria-describedby={errors.pseudo ? "pseudo-error" : undefined}
            {...register("pseudo")}
          />
          <FieldError id="pseudo-error" message={errors.pseudo?.message} />
        </div>
      )}

      <Button unstyled type="submit" variant="success" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Connexion..." : "Rejoindre →"}
      </Button>

      <FieldError id="join-session-error" message={errors.root?.message} />
    </form>
  );
};

export default JoinSessionForm;
