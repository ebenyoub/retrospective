import Container from "@/components/ui/Container";
import FormContainer from "@/components/ui/FormContainer";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import SpinContainer from "@/components/ui/SpinContainer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/toast/useToast";
import useFormValidation from "@/hooks/useFormValidation";
import type { ValidationSchema } from "@/hooks/useFormValidation";
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from "@/lib/apiError";
import { DEFAULT_RETRO_FORMAT_ID, RETRO_FORMAT_OPTIONS, getRetroFormatById } from "@/lib/retroFormats";
import { createSession } from "./services/sessionApi";
import type { CreatedSession } from './types/session.types';

interface CreateSessionValues {
  name: string;
  formatId: string;
}

const createSessionValidationSchema: ValidationSchema<CreateSessionValues> = {
  name: [
    (value) => value.trim() === "" ? "Le nom de la session est requis." : undefined,
    (value) => value.trim().length < 3 ? "Le nom doit faire au moins 3 caractères." : undefined,
  ],
  formatId: [
    (value) => value.trim() === "" ? "Le format est requis." : undefined,
  ],
};

const SessionCreate = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(null);

  const {
    values,
    errors,
    isLoading,
    handleInputChange,
    validateAll,
    setIsLoading
  } = useFormValidation<CreateSessionValues>(
    { name: "", formatId: DEFAULT_RETRO_FORMAT_ID },
    createSessionValidationSchema
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateAll()) {
      addToast('invalid', "Veuillez corriger les erreurs.");
      return;
    }

    const selectedFormat = getRetroFormatById(values.formatId);

    try {
      setIsLoading(true);

      const result = await createSession({
        name: values.name,
        formatName: selectedFormat.name,
        formatColumns: selectedFormat.columns,
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="flex justify-center mt-10 sm:mt-20">
      <SpinContainer onSpin={isLoading} className="w-full max-w-md">
        {!createdSession ? (
          <FormContainer onSubmit={handleSubmit}>
            <h1 className="text-xl font-bold text-slate-50 mb-6 text-center">Créer une session</h1>
            <FormField
              id="name"
              name="name"
              label="Nom de la session"
              type="text"
              value={values.name}
              placeholder="Rétrospective Sprint 5"
              disabled={isLoading}
              onChange={handleInputChange}
              onBlur={handleInputChange}
              error={errors.name}
              showValidState
            />
            <div className="mb-4 flex flex-col gap-1.5">
              <label htmlFor="formatId" className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Format de rétro
              </label>
              <select
                id="formatId"
                name="formatId"
                value={values.formatId}
                disabled={isLoading}
                onChange={handleInputChange}
                onBlur={handleInputChange}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-blue-400 disabled:opacity-60"
              >
                {RETRO_FORMAT_OPTIONS.map((format) => (
                  <option key={format.id} value={format.id}>
                    {format.name}
                  </option>
                ))}
              </select>
              {errors.formatId && <p className="text-sm text-red-400">{errors.formatId}</p>}
            </div>
            <Button unstyled type="submit" className="w-full justify-center">
              Créer la session
            </Button>
            <Button unstyled type="button" onClick={() => navigate('/sessions')} className="w-full justify-center mt-2 bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700">
              Voir mes sessions
            </Button>
          </FormContainer>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-white/10 rounded-xl shadow-2xl text-center">
            <h2 className="text-2xl font-extrabold text-green-400 mb-2">Félicitations !</h2>
            <p className="text-slate-300 text-sm mb-6">La session <strong>{createdSession.name}</strong> a été créée.</p>
            
            <div className="w-full p-4 mb-6 bg-slate-800 border border-white/10 rounded-lg">
              <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Code de la session</span>
              <span className="text-3xl font-black font-mono text-white tracking-widest">{createdSession.code}</span>
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
