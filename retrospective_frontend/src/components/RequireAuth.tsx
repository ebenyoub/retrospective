import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";

// Protège une page privée : si l'utilisateur n'est pas connecté,
// il est redirigé vers la page de connexion.
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
