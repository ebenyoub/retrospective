export interface UseSessionIdentityOptions {
  sessionId: string;
  isSessionReady: boolean;
  isAuthenticated: boolean;
  userId: number | null;
  ownerId: number | null;
  sessionStatus: string;
}
