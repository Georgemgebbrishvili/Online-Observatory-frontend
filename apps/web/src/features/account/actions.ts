import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
} from "@darkview/contracts";
import { zUpdateProfileResponse } from "@darkview/contracts/zod";

import type { Locale } from "@/i18n/config";
import { profileCopy } from "@/i18n/resources/profile";
import { ApiRequestError, apiRequest } from "@/lib/platform/browser";

// Runs in the browser, as the auth actions do: the API checks this page's Origin.

export type ProfileActionState = {
  /** A confirmation, once the platform has accepted the change. */
  done?: string;
  message?: string;
  errors?: Partial<Record<"name" | "email" | "currentPassword" | "password", string>>;
  /** The session ended: the page sends the visitor to sign in. */
  signedOut?: boolean;
  user?: User;
};

function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function secret(formData: FormData, field: string) {
  return formData.get(field)?.toString() ?? "";
}

/** The refusal, by the field the platform names (ADR-040, ADR-042). */
function failure(locale: Locale, error: unknown): ProfileActionState {
  const copy = profileCopy[locale].errors;
  if (!(error instanceof ApiRequestError)) return { message: copy.unavailable };
  if (error.status === 401) return { signedOut: true };
  if (error.status === 429) return { message: copy.rateLimited };
  if (error.status === 422) {
    const fields = (error.error?.details as { fields?: unknown } | undefined)?.fields;
    const named = Array.isArray(fields) ? fields : [];
    if (named.includes("currentPassword")) {
      return { errors: { currentPassword: copy.wrongPassword } };
    }
    if (named.includes("email")) return { errors: { email: copy.sameEmail } };
    if (named.includes("displayName")) return { errors: { name: copy.shortName } };
    if (named.includes("password")) return { errors: { password: copy.weakPassword } };
  }
  return { message: copy.unavailable };
}

export async function updateProfileAction(
  locale: Locale,
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const copy = profileCopy[locale];
  const body: UpdateProfileRequest = {
    displayName: text(formData, "name"),
    locale: text(formData, "language") === "ka" ? "ka" : "en",
  };
  if ((body.displayName ?? "").length < 2) return { errors: { name: copy.errors.shortName } };
  try {
    const user = await apiRequest("/me", {
      method: "PATCH",
      body,
      schema: zUpdateProfileResponse,
    });
    return { done: copy.details.saved, user };
  } catch (error) {
    return failure(locale, error);
  }
}

export async function changeEmailAction(
  locale: Locale,
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const copy = profileCopy[locale];
  const body: ChangeEmailRequest = {
    email: text(formData, "email"),
    currentPassword: secret(formData, "currentPassword"),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return { errors: { email: copy.errors.invalidEmail } };
  }
  try {
    await apiRequest("/me/email", { method: "POST", body });
    return { done: copy.email.sent(body.email) };
  } catch (error) {
    return failure(locale, error);
  }
}

export async function changePasswordAction(
  locale: Locale,
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const copy = profileCopy[locale];
  const body: ChangePasswordRequest = {
    currentPassword: secret(formData, "currentPassword"),
    password: secret(formData, "password"),
  };
  if (body.password.length < 12 || body.password.length > 128) {
    return { errors: { password: copy.errors.weakPassword } };
  }
  try {
    await apiRequest("/me/password", { method: "POST", body });
    return { done: copy.password.changed };
  } catch (error) {
    return failure(locale, error);
  }
}
