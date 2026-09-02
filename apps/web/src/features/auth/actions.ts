"use server";

import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/config";
import { authCopy } from "@/i18n/resources/auth";
import { PlatformError, platformRequest } from "@/lib/platform/client";

export type AuthActionState = {
  message?: string;
  errors?: { name?: string; email?: string; password?: string };
};

type AuthResponse = {
  status: "ok" | "rejected";
  message?: string;
  errors?: AuthActionState["errors"];
};

function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

async function callAuthEndpoint(
  locale: Locale,
  path: string,
  body: Record<string, unknown>,
): Promise<AuthActionState | null> {
  try {
    const result = await platformRequest<AuthResponse>(path, { method: "POST", body });
    return result.status === "ok" ? null : { message: result.message, errors: result.errors };
  } catch (error) {
    if (error instanceof PlatformError && error.status === 429) {
      return { message: authCopy[locale].errors.rateLimited };
    }
    return { message: authCopy[locale].errors.unavailable };
  }
}

export async function signInAction(
  locale: Locale,
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const failure = await callAuthEndpoint(locale, "/v1/auth/sign-in", {
    locale,
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (failure) return failure;
  redirect(`/${locale}/app`);
}

export async function registerAction(
  locale: Locale,
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const failure = await callAuthEndpoint(locale, "/v1/auth/register", {
    locale,
    name: text(formData, "name"),
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (failure) return failure;
  redirect(`/${locale}/verify-email`);
}

export async function verifyEmailAction(locale: Locale, token: string) {
  const failure = await callAuthEndpoint(locale, "/v1/auth/verify-email", { locale, token });
  if (failure) redirect(`/${locale}/verify-email/${encodeURIComponent(token)}?invalid=1`);
  redirect(`/${locale}/app`);
}

export async function logoutAction(locale: Locale, formData: FormData) {
  await callAuthEndpoint(locale, "/v1/auth/logout", {
    locale,
    csrfToken: text(formData, "csrfToken"),
  });
  redirect(`/${locale}/sign-in`);
}
