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
