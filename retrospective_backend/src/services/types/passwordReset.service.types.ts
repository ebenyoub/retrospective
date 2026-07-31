export interface ForgotPasswordInput {
  email: unknown;
}

export interface VerifyCodeInput {
  email: unknown;
  code: unknown;
}

export interface ResetPasswordInput {
  email: unknown;
  tempToken: unknown;
  newPassword: unknown;
}
