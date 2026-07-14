import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/FormContainer";
import FieldError from "@/components/ui/FieldError";
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from "@/lib/apiError";
import { guestJoin } from "../services/participantApi";
import type { GuestJoinResponse } from '../types/participant.types';

// Même règle que côté backend (validators/participant.validator.ts) : lettres
// (accents inclus), chiffres, espaces, apostrophes et tirets.
const PSEUDO_REGEX = /^[\p{L}\p{N} '’-]+$/u;

const pseudoFormSchema = z.object({
  pseudo: z
    .string({ error: "Le pseudo est requis." })
    .trim()
    .min(2, "Le pseudo doit contenir au moins 2 caractères.")
    .max(30, "Le pseudo ne peut pas dépasser 30 caractères.")
    .regex(PSEUDO_REGEX, "Le pseudo ne peut contenir que des lettres, chiffres, espaces, apostrophes et tirets."),
});

type PseudoFormValues = z.infer<typeof pseudoFormSchema>;

interface JoinSessionModalProps {
  sessionId: string;
  sessionName?: string;
  onJoined: (result: GuestJoinResponse) => void;
}

const JoinSessionModal = ({ sessionId, sessionName, onJoined }: JoinSessionModalProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PseudoFormValues>({
    resolver: zodResolver(pseudoFormSchema),
    defaultValues: { pseudo: "" },
  });

  const onSubmit = async (values: PseudoFormValues) => {
    try {
      const result = await guestJoin(sessionId, values.pseudo);

      if (!result.ok) {
        const fallback = result.status === 403 ? "Cette session est complète." : "Impossible de rejoindre la session.";
        setError("pseudo", { message: getApiErrorMessage(result.payload, fallback) });
        return;
      }

      onJoined(result.data);
    } catch (error) {
      console.error(error);
      setError("pseudo", { message: NETWORK_ERROR_MESSAGE });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-session-title"
        className="w-full max-w-sm rounded-figma-xl border border-navy-border bg-navy-mid p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
      >
        <h1 id="join-session-title" className="text-lg font-bold text-slate-50 mb-1 text-center">
          Rejoindre la rétrospective
        </h1>
        <p className="text-sm text-slate-400 mb-6 text-center">
          {sessionName || "Choisissez un pseudo pour rejoindre la salle d'attente."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pseudo" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Pseudo
            </label>
            <Input
              id="pseudo"
              placeholder="Ex : EBNoob"
              autoFocus
              disabled={isSubmitting}
              aria-invalid={!!errors.pseudo}
              aria-describedby={errors.pseudo ? "pseudo-error" : undefined}
              {...register("pseudo")}
            />
            <FieldError id="pseudo-error" message={errors.pseudo?.message} />
          </div>

          <Button unstyled type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Rejoindre la session"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default JoinSessionModal;
