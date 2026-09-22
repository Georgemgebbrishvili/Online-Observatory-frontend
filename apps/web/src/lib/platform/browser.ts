import type { ApiError } from "@darkview/contracts";
import { zApiError } from "@darkview/contracts/zod";

/**
 * Browser calls to the platform API, which ADR-016 §4 serves on this host at /api.
 * Same-origin, so the browser sends the session cookies and the Origin header the
 * API checks on every mutation, and receives the cookies the API sets.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly error: ApiError | null;

  constructor(status: number, error: ApiError | null) {
    super(error?.message ?? `Platform API answered ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.error = error;
  }
}

type Schema<T> = { parse: (value: unknown) => T };

export async function apiRequest<T = void>(
  path: string,
  init: { method?: string; body?: unknown; schema?: Schema<T> } = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: init.method ?? "GET",
    credentials: "same-origin",
    headers: init.body === undefined ? undefined : { "content-type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const parsed = zApiError.safeParse(await response.json().catch(() => null));
    throw new ApiRequestError(response.status, parsed.success ? parsed.data : null);
  }

  if (!init.schema || response.status === 204) {
    return undefined as T;
  }
  return init.schema.parse(await response.json());
}
