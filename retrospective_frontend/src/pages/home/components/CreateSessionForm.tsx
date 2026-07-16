import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/FormContainer";
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from "@/lib/apiError";
import FieldError from "@/components/ui/FieldError";

import { API_BASE } from "@/lib/api";
import { DEFAULT_RETRO_FORMAT_ID, RETRO_FORMAT_OPTIONS, getRetroFormatById } from "@/lib/retroFormats";

const createSessionSchema = z.object({
  retroName: z.string().trim().min(3, "Le nom de la rétrospective doit contenir au moins 3 caractères."),
  formatId: z.string().min(1, "Le format est requis."),
  stepDurationMinutes: z.number({ error: "La durée des étapes est requise." })
    .int("La durée doit être un nombre entier de minutes.")
    .min(1, "La durée doit être d'au moins 1 minute.")
    .max(120, "La durée ne peut pas dépasser 120 minutes."),
});

type CreateSessionValues = z.infer<typeof createSessionSchema>;

interface CreateSessionFormProps {
  onSessionCreated: (sessionId: number) => void;
}

// Facilitateur déjà connecté : uniquement le nom de la rétrospective.
const CreateSessionForm = ({ onSessionCreated }: CreateSessionFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { retroName: "", formatId: DEFAULT_RETRO_FORMAT_ID, stepDurationMinutes: 5 },
  });

  const onSubmit = async (values: CreateSessionValues) => {
    const selectedFormat = getRetroFormatById(values.formatId);

    try {
      const response = await fetch(`${API_BASE}/session/create-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.retroName.trim(),
          formatName: selectedFormat.name,
          formatColumns: selectedFormat.columns,
          stepDurationMinutes: values.stepDurationMinutes,
        }),
      });
      const data = await readJsonSafely(response);

      if (!response.ok || !isApiSuccess<{ sessionId: number }>(data)) {
        setError("retroName", { message: getApiErrorMessage(data, "Impossible de créer la rétrospective.") });
        return;
      }

      onSessionCreated(data.data.sessionId);
    } catch (error) {
      console.error(error);
      setError("root", { message: NETWORK_ERROR_MESSAGE });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate aria-busy={isSubmitting}>
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="formatId" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Format de rétro
        </label>
        <select
          id="formatId"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-blue-400 disabled:opacity-60"
          {...register("formatId")}
        >
          {RETRO_FORMAT_OPTIONS.map((format) => (
            <option key={format.id} value={format.id}>
              {format.name}
            </option>
          ))}
        </select>
        <FieldError id="formatId-error" message={errors.formatId?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="stepDurationMinutes" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Durée des étapes (minutes)
        </label>
        <Input
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
      </div>

      <div className="pt-1">
        <Button unstyled type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer et lancer"}
        </Button>
      </div>

      <FieldError id="create-session-error" message={errors.root?.message} />
    </form>
  );
};

export default CreateSessionForm;
