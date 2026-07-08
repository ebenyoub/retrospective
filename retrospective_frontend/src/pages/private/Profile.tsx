import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FormContainer, { FormTitle } from "@/components/ui/FormContainer";
import FormField from "@/components/ui/FormField";
import SpinContainer from "@/components/ui/SpinContainer";
import { useAuth } from "@/context/auth/useAuth";
import { getApiErrorMessage, isApiSuccess, NETWORK_ERROR_MESSAGE, readJsonSafely } from "@/lib/apiError";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

type Step = 'MENU' | 'CODE';

const Profile = () => {
  const { username, token } = useAuth();
  
  const [step, setStep] = useState<Step>('MENU')
  const [code, setCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:8000/session/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await readJsonSafely(response);

      if (response.ok && isApiSuccess<{ sessionId?: number }>(data)) {
        
        const { sessionId } = data.data;
        
        if (sessionId) {
          console.log("Redirection vers la session");
          navigate(`/session/${sessionId}`);
        } else {
          setGlobalError("Jointure réussie, mais ID de session manquant.")
        }
      } else {
        setGlobalError(getApiErrorMessage(data, "Code invalide."));
      }
    } catch (err) {
      console.log(err);
      setGlobalError(NETWORK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {step === 'MENU' && (
        <Container className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <h2 className="text-slate-200">Bienvenue {username}</h2>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={() => setStep("CODE")}>Rejoindre un groupe</Button>
            <Button onClick={() => navigate("/session")}>Créer une rétrospective</Button>
            <Button onClick={() => navigate("/sessions")}>Mes sessions</Button>
          </div>
        </Container>
      )}

      {step === 'CODE' && (
        <Container className="flex justify-center items-center min-h-[60vh]">
          <SpinContainer onSpin className="w-full max-w-md">
            <FormContainer onSubmit={handleCodeSubmit}>
              <FormTitle>Code de la rétrospective</FormTitle>

              <FormField
                id="code"
                label="Code à 4 chiffres"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={code}
                autoFocus
                disabled={isLoading}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                placeholder="1234"
                className="text-center tracking-widest text-lg"
                error={inputErrors.code}
              />

              {globalError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded text-center text-sm">
                  {globalError}
                </div>
              )}

              <Button disabled={isLoading}>
                {isLoading ? "Vérification..." : "Valider le code"}
              </Button>

              <button
                type="button"
                onClick={() => { setStep('MENU'); setGlobalError(""); }}
                className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline w-full text-center"
              >
                retour
              </button>
            </FormContainer>
          </SpinContainer>
        </Container>
      )}
    </>
  );
};

export default Profile;
