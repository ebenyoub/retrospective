import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Container from "@/components/ui/Container";
import Form, { FormField, FormLabel, FormInput, FormTitle } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import SpinContainer from "@/components/ui/SpinContainer";
import RetroFormatDropdown from "@/components/RetroFormatDropdown";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/toast/useToast";
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from "@/lib/apiError";
import { DEFAULT_RETRO_FORMAT_ID, getRetroFormatById } from "@/lib/retroFormats";
import { createSession } from "./services/sessionApi";
import type { CreatedSession } from './types/session.types';

const createSessionSchema = z.object({
  name: z.string()
    .refine((value) => value.trim() !== "", "Le nom de la session est requis.")
    .refine((value) => value.trim().length >= 3, "Le nom doit faire au moins 3 caractères."),
  formatId: z.string()
    .refine((value) => value.trim() !== "", "Le format est requis."),
  col1: z.string().trim().min(1, "Colonne 1 requise.").optional(),
  col2: z.string().trim().min(1, "Colonne 2 requise.").optional(),
  col3: z.string().trim().min(1, "Colonne 3 requise.").optional(),
});

type CreateSessionValues = z.infer<typeof createSessionSchema>;

const SessionCreate = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { name: "", formatId: DEFAULT_RETRO_FORMAT_ID, col1: "Colonne 1", col2: "Colonne 2", col3: "Colonne 3" },
    mode: "all",
  });

  const formatId = watch("formatId");

  const onSubmit = async (values: CreateSessionValues) => {
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
      const result = await createSession({
        name: values.name,
        formatName,
        formatColumns,
        stepDurationMinutes: 5,
      });

      if (result.ok) {
        setCreatedSession(result.data);
        addToast("success", "Session créée avec succès !");
      } else {
        addToast("error", getApiErrorMessage(result.payload, "Impossible de créer la session."));
      }
    } catch (error) {
      console.error(error);
      addToast("error", NETWORK_ERROR_MESSAGE);
    }
  };

  const onInvalid = () => {
    addToast('invalid', "Veuillez corriger les erreurs.");
  };

  return (
    <Container className="flex justify-center mt-10 sm:mt-20">
      <SpinContainer onSpin={isSubmitting} className="w-full max-w-md">
        {!createdSession ? (
          <Form onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <FormTitle className="mb-6">Créer une session</FormTitle>

            <FormField>
              <FormLabel htmlFor="name">Nom de la session</FormLabel>
              <FormInput
                id="name"
                type="text"
                placeholder="Rétrospective Sprint 5"
                disabled={isSubmitting}
                className={errors.name ? 'border-red-500' : ''}
                {...register("name")}
              />
              {errors.name && <small className="text-red-500 text-xs mt-1">{errors.name.message}</small>}
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
              {errors.formatId && <small id="formatId-error" className="text-red-500 text-xs mt-1">{errors.formatId.message}</small>}
            </FormField>

            {formatId === "custom-3-columns" && (
              <div className="grid grid-cols-3 gap-2">
                <FormField>
                  <FormLabel htmlFor="col1">Col. 1</FormLabel>
                  <FormInput
                    id="col1"
                    disabled={isSubmitting}
                    className={errors.col1 ? 'border-red-500' : ''}
                    {...register("col1")}
                  />
                  {errors.col1 && <small className="text-red-500 text-xs mt-1">{errors.col1.message}</small>}
                </FormField>
                <FormField>
                  <FormLabel htmlFor="col2">Col. 2</FormLabel>
                  <FormInput
                    id="col2"
                    disabled={isSubmitting}
                    className={errors.col2 ? 'border-red-500' : ''}
                    {...register("col2")}
                  />
                  {errors.col2 && <small className="text-red-500 text-xs mt-1">{errors.col2.message}</small>}
                </FormField>
                <FormField>
                  <FormLabel htmlFor="col3">Col. 3</FormLabel>
                  <FormInput
                    id="col3"
                    disabled={isSubmitting}
                    className={errors.col3 ? 'border-red-500' : ''}
                    {...register("col3")}
                  />
                  {errors.col3 && <small className="text-red-500 text-xs mt-1">{errors.col3.message}</small>}
                </FormField>
              </div>
            )}

            <Button unstyled type="submit" className="w-full justify-center">
              Créer la session
            </Button>
            <Button unstyled type="button" onClick={() => navigate('/sessions')} className="w-full justify-center mt-2 bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700">
              Voir mes sessions
            </Button>
          </Form>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-white/10 rounded-xl shadow-2xl text-center">
            <h2 className="text-2xl font-extrabold text-green-400 mb-2">Félicitations !</h2>
            <p className="text-slate-300 text-sm mb-6">La session <strong>{createdSession.name}</strong> a été créée.</p>

            <div className="w-full p-4 mb-6 bg-slate-800 border border-white/10 rounded-lg">
              <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Code de la session</span>
              <span className="text-3xl font-black font-mono text-white tracking-widest">{createdSession.joinCode}</span>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Partagez ce code à vos collaborateurs pour qu'ils rejoignent la rétrospective.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button unstyled onClick={() => navigate(`/session/${createdSession.sessionId}`)} className="w-full justify-center bg-blue-500 text-white hover:bg-blue-400 font-semibold py-2">
                Accéder au tableau
              </Button>
              <Button unstyled onClick={() => navigate('/sessions')} className="w-full justify-center bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700 py-2">
                Retour à mes sessions
              </Button>
            </div>
          </div>
        )}
      </SpinContainer>
    </Container>
  );
};

export default SessionCreate;
