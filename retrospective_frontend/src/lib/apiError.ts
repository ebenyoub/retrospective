export const DEFAULT_API_ERROR_MESSAGE = "Une erreur est survenue.";
export const NETWORK_ERROR_MESSAGE = "Erreur de connexion au serveur.";

export const getApiErrorMessage = (payload: unknown, fallback = DEFAULT_API_ERROR_MESSAGE): string => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === "string" && message.trim() !== "") {
      return message;
    }
  }

  return fallback;
};

export const isApiSuccess = <TData = unknown>(
  payload: unknown
): payload is { success: true; data: TData; message?: string } =>
  Boolean(payload && typeof payload === "object" && "success" in payload && payload.success === true);

export const readJsonSafely = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};
