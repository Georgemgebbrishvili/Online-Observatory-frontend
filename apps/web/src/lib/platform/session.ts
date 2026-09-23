import "server-only";

import type { User } from "@darkview/contracts";
import { zGetCurrentUserResponse } from "@darkview/contracts/zod";
import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/config";

import { platformRequest } from "./client";

/**
 * GET /me. `null` when the request carries no valid session.
 *
 * Any failure answers `null`, not an exception: nobody is authenticated when the
 * platform cannot say who they are, so this fails closed. Rethrowing turned an
 * unreachable API into a 500 on /sign-in, /register, /app and every /admin route,
 * which told a visitor nothing and served a broken page instead of a sign-in form.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return zGetCurrentUserResponse.parse(await platformRequest<unknown>("/me"));
  } catch {
    return null;
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
