import type { NativeSession } from "@darkview/contracts";

import { PlatformError } from "./api";

export type SignInFailure = "wrong" | "unverified" | "limited" | "unavailable";

/** What a refused native sign-in tells the customer (ADR-061 keeps sign-in's refusals). */
export function failureOf(error: unknown): SignInFailure {
  if (!(error instanceof PlatformError)) return "unavailable";
  if (error.status === 401) return "wrong";
  if (error.status === 403 && error.code === "EMAIL_UNVERIFIED") return "unverified";
  if (error.status === 429) return "limited";
  return "unavailable";
}

/** A stored session is used only until it lapses; after that it is forgotten unasked. */
export function isCurrent(session: NativeSession, now = Date.now()) {
  return Date.parse(session.expiresAt) > now;
}
