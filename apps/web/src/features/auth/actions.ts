import type {
  RegisterRequest,
  SignInRequest,
  VerifyEmailRequest,
} from "@darkview/contracts";
import { zSignInResponse, zVerifyEmailResponse } from "@darkview/contracts/zod";

import type { Locale } from "@/i18n/config";
import { authCopy } from "@/i18n/resources/auth";
import { ApiRequestError, apiRequest } from "@/lib/platform/browser";

// Runs in the browser. ADR-016: the API sets the session cookies on its own
// response, so the request has to come from the page, not from this server.

export type AuthActionState = {
  message?: string;
  errors?: { name?: string; email?: string; password?: string };
  redirectTo?: string;
};

function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function failure(locale: Locale, error: unknown): AuthActionState {
  const copy = authCopy[locale].errors;
  if (!(error instanceof ApiRequestError)) return { message: copy.unavailable };
  switch (error.status) {
    case 401:
      return { message: copy.invalidCredentials };
    case 403:
      return { message: copy.unverified };
    case 422:
      return { errors: { email: copy.invalidEmail } };
    case 429:
      return { message: copy.rateLimited };
    default:
      return { message: copy.unavailable };
  }
}

export async function signInAction(
  locale: Locale,
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const body: SignInRequest = {
    email: text(formData, "email"),
    password: formData.get("password")?.toString() ?? "",
  };
  try {
    await apiRequest("/auth/sign-in", { method: "POST", body, schema: zSignInResponse });
    return { redirectTo: `/${locale}/app` };
  } catch (error) {
    return failure(locale, error);
  }
}

export async function registerAction(
  locale: Locale,
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const copy = authCopy[locale].errors;
  const body: RegisterRequest = {
    displayName: text(formData, "name"),
    email: text(formData, "email"),
    password: formData.get("password")?.toString() ?? "",
    locale,
  };
  if (body.displayName.length < 2) return { errors: { name: copy.shortName } };
  if (body.password.length < 12 || body.password.length > 128) {
    return { errors: { password: copy.weakPassword } };
  }
  try {
    await apiRequest("/auth/register", { method: "POST", body });
    return { redirectTo: `/${locale}/verify-email` };
  } catch (error) {
    return failure(locale, error);
  }
}

export async function verifyEmail(token: string) {
  const body: VerifyEmailRequest = { token };
  await apiRequest("/auth/verify-email", {
    method: "POST",
    body,
    schema: zVerifyEmailResponse,
  });
}

export async function signOut() {
  await apiRequest("/auth/sign-out", { method: "POST" });
}
