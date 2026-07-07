// Erreur "prévue" (métier/validation) qui porte son propre code HTTP.
// Permet à errorHandler de distinguer une erreur attendue d'un bug non prévu.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
