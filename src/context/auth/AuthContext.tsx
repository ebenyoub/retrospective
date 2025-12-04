import { AuthContext } from "@/context/auth/useAuth";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || "")
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!token || false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();


  const login = (data: {
    token: string;
    userId: number;
    username: string;
    email: string;
  }) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setIsAuthenticated(true);
    setUserId(data.userId);
    setUsername(data.username);
    setEmail(data.email);

    navigate('/profile', {
      replace: true,
    });
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
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
        const response = await fetch("http://localhost:8000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          logout();
          return;
        }

        const user = await response.json();
        setUserId(user.userId);
        setUsername(user.username);
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
