import { isApiSuccess, readJsonSafely } from '@/lib/apiError';

export type ApiResponse<TData> =
  | { ok: true; data: TData; payload: unknown; status: number }
  | { ok: false; payload: unknown; status: number };

export const requestApi = async <TData>(
  url: string,
  init?: RequestInit
): Promise<ApiResponse<TData>> => {
  // credentials: 'include' — l'authentification passe par un cookie HttpOnly,
  // que le navigateur n'envoie entre deux origines que si on le demande.
  const response = await fetch(url, { credentials: 'include', ...init });
  const payload = await readJsonSafely(response);

  if (response.ok && isApiSuccess<TData>(payload)) {
    return { ok: true, data: payload.data, payload, status: response.status };
  }

  return { ok: false, payload, status: response.status };
};

export const requestApiCommand = async (
  url: string,
  init?: RequestInit
): Promise<ApiResponse<unknown>> => requestApi<unknown>(url, init);
