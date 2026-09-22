import "server-only";

import { cookies } from "next/headers";

import { csrfCookieName, platformApiBaseUrl, sessionCookieName } from "./config";

export class PlatformError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PlatformError";
    this.status = status;
  }
}

// ADR-016 §2: a session is valid only when both cookies arrive together.
async function forwardedCookies() {
  const jar = await cookies();
  return [sessionCookieName, csrfCookieName]
    .map((name) => {
      const value = jar.get(name)?.value;
      return value ? `${name}=${value}` : null;
    })
    .filter(Boolean)
    .join("; ");
}

/**
 * Server-side reads from the platform API, on the visitor's session. Mutations go
 * from the browser to /api directly (see ./browser.ts): the API refuses any
 * mutation whose Origin is not the web client's, and it sets its cookies on the
 * response the browser receives (ADR-016 §3–4).
 */
export async function platformRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const cookie = await forwardedCookies();
  const response = await fetch(`${platformApiBaseUrl}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new PlatformError(detail || response.statusText, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
