import { config } from "zod";

// Zod probes `new Function("")` to compile its validators, and the site's CSP rightly
// refuses eval, so every page that validates logged a CSP violation. Interpreted
// validation is what ran anyway; this skips the probe.
config({ jitless: true });

// ADR-064 §4: browser errors, only when a DSN was built in, sent through /monitoring
// on this site so the CSP's connect-src stays 'self'. Loaded on demand: a build
// without a DSN never downloads the SDK.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  void Promise.all([import("@sentry/nextjs"), import("@/lib/monitoring/options")]).then(
    ([Sentry, { monitoringOptions }]) => {
      const monitoring = monitoringOptions(
        dsn,
        process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
      );
      if (!monitoring) return;
      Sentry.init({
        ...monitoring,
        tunnel: "/monitoring",
        // Phase 6.10: real-user Web Vitals (LCP, INP, CLS) from a tenth of page loads,
        // carried by the page-load trace. No trace header goes to any other origin.
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 0.1,
        tracePropagationTargets: [],
      });
    },
  );
}
