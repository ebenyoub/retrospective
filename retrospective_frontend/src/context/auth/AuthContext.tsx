import { AuthContext } from "@/context/auth/useAuth";
import type { AuthLoginData } from "./types/auth.types";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfileApi, logoutApi } from "@/pages/auth/services/authApi";

const clearGuestIdentities = () => {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('retro:guest:')) {
      localStorage.removeItem(key);
    }
  }
};

// L'authentification vit dans un cookie HttpOnly posé par le backend :
// le JavaScript ne peut ni le lire ni le stocker. Ce provider ne garde
// en mémoire que les informations de l'utilisateur connecté.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Ne navigue pas : chaque page appelante décide où rediriger après connexion
  // (session active, liste des sessions, accueil...).
  const login = (data: AuthLoginData) => {
    clearGuestIdentities();
    setIsAuthenticated(true);
    setUserId(data.userId);
    setUsername(data.username);
    setEmail(data.email);
  }

  const logout = useCallback(async () => {
    clearGuestIdentities();

    // Un cookie HttpOnly ne peut être effacé que par le serveur.
    try {
      await logoutApi();
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }

    setIsAuthenticated(false);
    setUserId(null);
    setUsername("");
    setEmail("");
    navigate("/", { replace: true });
  }, [navigate])

  // Au chargement de l'application : le cookie est invisible côté JS,
  // on demande donc au backend qui est connecté. Une réponse 401 signifie
  // simplement "personne" (visiteur ou session expirée).
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const result = await fetchProfileApi();

        if (result.ok) {
          setIsAuthenticated(true);
          setUserId(result.data.userId);
          setUsername(result.data.username);
        }
      } catch (error) {
        console.error("Erreur fetchProfile :", error);
      } finally {
        setIsAuthReady(true);
      }
    };

    void restoreSession();
  }, [])

  const value = {
    isAuthenticated,
    userId,
    username,
    email,
    login,
    logout
  }

  // Tant qu'on ne sait pas si un utilisateur est connecté, on n'affiche
  // rien : cela évite un aller-retour visuel (accueil visiteur → accueil
  // connecté) à chaque rechargement.
  if (!isAuthReady) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
