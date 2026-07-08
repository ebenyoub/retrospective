import Container from "@/components/ui/Container";
import { useAuth } from "@/context/auth/useAuth";
import { useEffect, useRef, useState } from "react";

const SessionCreate = () => {
  const { token } = useAuth();

  // DRAPEAU DE RÉFÉRENCE : Vaut true si l'appel a déjà été fait.
  const hasFetched = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!token) return;

    // 2. Vérification du double appel (Ignoré lors du second appel StrictMode)
    if (hasFetched.current) {
      return;
    }

    // 3. Positionner le drapeau pour les appels futurs.
    hasFetched.current = true; // L'appel est initié

    const createSession = async () => {
      setIsLoading(true);
      setGlobalError("");

      try {
        const response = await fetch("http://localhost:8000/session/create-session", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Session créé avec succès : ", data);
        setCode(data.data.code);

      } catch (error) {
        console.log(error)
        setGlobalError("Impossible de créer la session sur le serveur.");
      } finally {
        setIsLoading(false);
      }
    }

    createSession();

  }, [token])

  return (

    <Container className="w-full pt-3">
      <h1 className="text-center mt-0">Créer une session</h1>
      <p className="text-center mt-4">Votre code de session : <strong>{isLoading ? "Chargement..." : code}</strong></p>
      {globalError && (
        <div id="form-feedback" role="alert" aria-live="assertive" className="text-red-600 mt-5">
          {globalError}
        </div>
      )}

    </Container>
  );
};

export default SessionCreate;
