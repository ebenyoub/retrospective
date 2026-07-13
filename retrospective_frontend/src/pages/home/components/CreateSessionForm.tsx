import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/FormContainer";
import { useAuth } from "@/context/auth/useAuth";
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from "@/lib/apiError";
import FieldError from "@/components/ui/FieldError";

const API_BASE = "http://localhost:8000";

const createSessionSchema = z.object({
  retroName: z.string().trim().min(3, "Le nom de la rétrospective doit contenir au moins 3 caractères."),
});

type CreateSessionValues = z.infer<typeof createSessionSchema>;

interface CreateSessionFormProps {
  onSessionCreated: (sessionId: number) => void;
}

// Facilitateur déjà connecté : uniquement le nom de la rétrospective.
const CreateSessionForm = ({ onSessionCreated }: CreateSessionFormProps) => {
  const { token } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { retroName: "" },
  });

  const onSubmit = async (values: CreateSessionValues) => {
    try {
      const response = await fetch(`${API_BASE}/session/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: values.retroName.trim() }),
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

      <div className="pt-1">
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer et lancer"}
        </Button>
      </div>

      <FieldError id="create-session-error" message={errors.root?.message} />
    </form>
  );
};

export default CreateSessionForm;
