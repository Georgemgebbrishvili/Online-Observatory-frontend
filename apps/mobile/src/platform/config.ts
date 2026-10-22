// The platform's API, and the website that books for this app until a native client
// can sign in (ADR-059). Identifiers keep the darkview name (ADR-025).
export const platformApiBaseUrl =
  process.env.EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL ?? "http://127.0.0.1:4000";

export const webAppUrl = process.env.EXPO_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Where /ws/mission and /stream/mission are served. In production the website's host
 * serves both, as it serves /api; in development it is the realtime service itself.
 */
export const realtimeBaseUrl = process.env.EXPO_PUBLIC_DARKVIEW_REALTIME_URL ?? webAppUrl;

/** A screen waits this long for an answer, then shows its unavailable state. */
export const platformTimeoutMs = 10_000;
