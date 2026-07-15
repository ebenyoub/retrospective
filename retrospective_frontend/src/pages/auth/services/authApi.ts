import { requestApi } from '@/pages/session/services/http';
import { API_BASE } from '@/lib/api';
import type { AuthLoginData } from '@/context/auth/useAuth';

export interface LoginValues {
  email: string;
  password: string;
}

export interface SignupValues {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

export interface ProfileResponse {
  userId: number;
  username: string;
}

export const loginApi = (values: LoginValues) =>
  requestApi<AuthLoginData>(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

export const signupApi = (values: SignupValues) =>
  requestApi<AuthLoginData>(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

export const forgotApi = (email: string) =>
  requestApi<unknown>(`${API_BASE}/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

export const verifyCodeApi = (email: string, code: string) =>
  requestApi<unknown>(`${API_BASE}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

export const resetPasswordApi = (email: string, newPassword: string, code: string) =>
  requestApi<unknown>(`${API_BASE}/auth/reset-password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword, code }),
  });

export const fetchProfileApi = () =>
  requestApi<ProfileResponse>(`${API_BASE}/auth/profile`);

export const logoutApi = () =>
  requestApi<unknown>(`${API_BASE}/auth/logout`, { method: 'POST' });
