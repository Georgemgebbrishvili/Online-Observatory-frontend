import { scrubBreadcrumb, scrubEvent } from "./scrub";

/**
 * ADR-064 §2: the SDK options, or null when no DSN is set and nothing may be sent.
 * Errors only: no tracing, no replay, no default PII.
 */
export function monitoringOptions(
  dsn: string | undefined,
  environment: string | undefined,
) {
  const trimmed = dsn?.trim();
  if (!trimmed) return null;
  return {
    dsn: trimmed,
    environment: environment?.trim() || process.env.NODE_ENV || "development",
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: <T extends object>(event: T) => scrubEvent(event),
    beforeBreadcrumb: <T extends object>(breadcrumb: T) => scrubBreadcrumb(breadcrumb),
  };
}

/**
 * The project a DSN names, as Sentry's ingest expects it, or null for anything else.
 * `https://<key>@<host>/<project>` -> the envelope URL on that host.
 */
export function envelopeUrl(dsn: string): string | null {
  try {
    const url = new URL(dsn);
    const project = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!url.username || !/^\d+$/.test(project)) return null;
    return `${url.protocol}//${url.host}/api/${project}/envelope/`;
  } catch {
    return null;
  }
}
