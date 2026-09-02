import "server-only";

import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/config";

import { PlatformError, platformRequest } from "./client";

export const roles = ["USER", "OPERATOR", "ADMIN"] as const;

export type Role = (typeof roles)[number];

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type VerifiedSession = {
  id: string;
  user: AuthenticatedUser;
  expiresAt: string;
  csrfToken: string;
};

export const observatoryAdministrativeRoles = ["OPERATOR", "ADMIN"] as const;

export async function getCurrentSession() {
  try {
    return await platformRequest<VerifiedSession>("/v1/session");
  } catch (error) {
    if (error instanceof PlatformError && error.status === 401) return null;
    throw error;
  }
}

export async function requireSession(locale: Locale) {
  const session = await getCurrentSession();
  if (!session) redirect(`/${locale}/sign-in`);
  return session;
}

export async function requireRole(locale: Locale, allowedRoles: readonly Role[]) {
  const session = await requireSession(locale);
  if (!allowedRoles.includes(session.user.role)) redirect(`/${locale}/app`);
  return session;
}
