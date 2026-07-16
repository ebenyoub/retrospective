import { AuthContext, type AuthLoginData } from "@/context/auth/useAuth";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfileApi } from "@/pages/auth/services/authApi";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || "")
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!token || false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();


  // Ne navigue pas : chaque page appelante décide où rediriger après connexion
  // (session active, liste des sessions, accueil...).
  const login = (data: AuthLoginData) => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('retro:guest:')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setIsAuthenticated(true);
    setUserId(data.userId);
    setUsername(data.username);
    setEmail(data.email);
  }

  const logout = useCallback(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('retro:guest:')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.removeItem('token');
    setToken("");
    setIsAuthenticated(false);
    setUserId(null);
    setUsername("");
    setEmail("");
    navigate("/", { replace: true });
  }, [navigate])

  const value = {
    isAuthenticated,
    userId,
    username,
    email,
    token,
    login,
    logout
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const result = await fetchProfileApi(token);

        if (!result.ok) {
          logout();
          return;
        }

        setUserId(result.data.userId);
        setUsername(result.data.username);
      } catch (error) {
        console.error("Erreur fetchProfile :", error);
        logout();
      }
    };

    if (token) fetchProfile();
  }, [token, logout, isAuthenticated])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
