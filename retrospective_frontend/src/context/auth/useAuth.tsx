import { createContext, useContext } from "react";
import type { AuthContextType } from './types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return context;
}
