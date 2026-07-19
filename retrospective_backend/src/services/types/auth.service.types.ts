export interface LoginInput {
  email: unknown;
  password: unknown;
}

export interface SignupInput {
  username: unknown;
  email: unknown;
  password: unknown;
}

export interface DeleteAccountInput {
  userId?: number;
  username?: string;
}

export interface ProfileInput {
  userId: number;
  username: string;
}

export interface AuthResult {
  token: string;
  userId: number;
  username: string;
  email?: string;
}
