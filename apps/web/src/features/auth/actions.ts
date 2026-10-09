import type {
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RegisterRequest,
  SignInRequest,
  VerifyEmailRequest,
} from "@darkview/contracts";
import {
  zConfirmPasswordResetResponse,
  zSignInResponse,
  zUser,
  zVerifyEmailResponse,
} from "@darkview/contracts/zod";

import type { Locale } from "@/i18n/config";
import { authCopy } from "@/i18n/resources/auth";
import { ApiRequestError, apiRequest } from "@/lib/platform/browser";

// Runs in the browser. ADR-016: the API sets the session cookies on its own
// response, so the request has to come from the page, not from this server.

export type AuthActionState = {
  message?: string;
  errors?: { name?: string; email?: string; password?: string };
  redirectTo?: string;
  /** A reset link that is unknown, used or expired (ADR-040's 404). */
  deadLink?: boolean;
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
    // The Origin refusal, which the visitor cannot fix. Sign-in's unverified-address
    // refusal is a 403 too, told apart by its code before this is reached.
    case 403:
      return { message: copy.unavailable };
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
    // By code, not status: a 403 is also what the cross-origin refusal answers, and
    // reading the status alone sent every visitor behind a misrouted proxy to verify
    // an address that was verified (the hosted demo, 2026-10-08).
    if (error instanceof ApiRequestError && error.error?.code === "EMAIL_UNVERIFIED") {
      return { message: authCopy[locale].errors.unverified };
    }
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
    // 200 with the user: the demo verified the address at once and signed it in
    // (platform ADR-049). 202 with nothing: a link is on its way.
    const user = await apiRequest("/auth/register", { method: "POST", body, schema: zUser });
    return { redirectTo: user ? `/${locale}/app` : `/${locale}/verify-email` };
  } catch (error) {
    return failure(locale, error);
  }
}

export async function requestPasswordResetAction(
  locale: Locale,
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const body: PasswordResetRequest = { email: text(formData, "email"), locale };
  try {
    await apiRequest("/auth/password-reset", { method: "POST", body });
    return { redirectTo: `/${locale}/reset-password?sent=1` };
  } catch (error) {
    return failure(locale, error);
  }
}

export async function confirmPasswordResetAction(
  locale: Locale,
  token: string,
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const copy = authCopy[locale].errors;
  const body: PasswordResetConfirmRequest = {
    token,
    password: formData.get("password")?.toString() ?? "",
  };
  if (body.password.length < 12 || body.password.length > 128) {
    return { errors: { password: copy.weakPassword } };
  }
  try {
    await apiRequest("/auth/password-reset/confirm", {
      method: "POST",
      body,
      schema: zConfirmPasswordResetResponse,
    });
    return { redirectTo: `/${locale}/app` };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404)
      return { deadLink: true };
    // A 422 names the fields it refused. A token mangled on its way out of an email
    // fails the contract's pattern: that is a dead link, not a weak password.
    if (error instanceof ApiRequestError && error.status === 422) {
      const fields = error.error?.details?.fields;
      if (Array.isArray(fields) && fields.includes("token")) return { deadLink: true };
      return { errors: { password: copy.weakPassword } };
    }
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
