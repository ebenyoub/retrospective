import { requestApi } from '@/pages/session/services/http';
import { API_BASE } from '@/lib/api';
import type { AuthLoginData } from '@/context/auth/types/auth.types';
import type { LoginValues, SignupValues, ProfileResponse } from '../types/auth.types';

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

export interface VerifyCodeResponse {
  tempToken: string;
}

export const verifyCodeApi = (email: string, code: string) =>
  requestApi<VerifyCodeResponse>(`${API_BASE}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

export const resetPasswordApi = (email: string, tempToken: string, newPassword: string) =>
  requestApi<unknown>(`${API_BASE}/auth/reset-password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, tempToken, newPassword }),
  });

export const fetchProfileApi = () =>
  requestApi<ProfileResponse>(`${API_BASE}/auth/profile`);

export const logoutApi = () =>
  requestApi<unknown>(`${API_BASE}/auth/logout`, { method: 'POST' });
