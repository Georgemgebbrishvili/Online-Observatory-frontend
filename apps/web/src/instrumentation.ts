/**
 * ADR-064: server errors go to Sentry only when SENTRY_DSN is set, scrubbed first.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { monitoringOptions } = await import("@/lib/monitoring/options");
  const monitoring = monitoringOptions(
    process.env.SENTRY_DSN,
    process.env.SENTRY_ENVIRONMENT,
  );
  if (!monitoring) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init(monitoring);
}

/** A render or route that threw. A page's own error state is not a throw. */
export async function onRequestError(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.SENTRY_DSN?.trim()) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
}
