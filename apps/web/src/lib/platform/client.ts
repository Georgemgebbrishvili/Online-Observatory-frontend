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

async function authenticationHeaders() {
  const jar = await cookies();
  const session = jar.get(sessionCookieName)?.value;
  const csrf = jar.get(csrfCookieName)?.value;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (session) headers.cookie = `${sessionCookieName}=${session}`;
  if (csrf) headers["x-csrf-token"] = csrf;
  return headers;
}

export async function platformRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${platformApiBaseUrl}${path}`, {
    method: init.method ?? "GET",
    headers: await authenticationHeaders(),
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
