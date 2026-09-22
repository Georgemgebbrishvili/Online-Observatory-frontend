import "server-only";

import type { User } from "@darkview/contracts";
import { zGetCurrentUserResponse } from "@darkview/contracts/zod";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/config";

import { PlatformError, platformRequest } from "./client";

/** GET /me. `null` when the request carries no valid session (401). */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return zGetCurrentUserResponse.parse(await platformRequest<unknown>("/me"));
  } catch (error) {
    if (error instanceof PlatformError && error.status === 401) return null;
    throw error;
  }
}

export async function requireUser(locale: Locale) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/sign-in`);
  return user;
}

/**
 * The page-level half of the operator boundary. The API is the enforcing half:
 * every /admin/* route answers 403 to a non-operator whatever this page does.
 */
export async function requireOperator(locale: Locale) {
  const user = await requireUser(locale);
  if (user.role !== "OPERATOR") redirect(`/${locale}/app`);
  return user;
}
