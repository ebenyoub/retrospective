import { createContext, useContext } from "react";

export interface AuthLoginData {
  userId: number;
  username: string;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  username: string;
  email: string;
  login: (data: AuthLoginData) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return context;
}
