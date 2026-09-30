export const sessionCookieName =
  process.env.NODE_ENV === "production" ? "__Host-darkview_session" : "darkview_session";

export const csrfCookieName =
  process.env.NODE_ENV === "production" ? "__Host-darkview_csrf" : "darkview_csrf";

export const platformApiBaseUrl =
  process.env.DARKVIEW_PLATFORM_API_URL ?? "http://127.0.0.1:4000";

/**
 * The platform's realtime service: the mission channel at /ws/mission/{id} and the live
 * view at /stream/mission/{id} (ADR-011). Both are same-origin paths on this host, as
 * /api is: the stream URL the service signs is on this app's origin, because the session
 * cookie it checks is only ever sent here.
 */
export const platformRealtimeUrl =
  process.env.DARKVIEW_REALTIME_URL ?? "http://127.0.0.1:4001";

/**
 * The capture bucket's origin, for `img-src`. Captures are signed URLs straight to the
 * bucket (ADR-012: private, no public path, nothing proxied), so the browser must be
 * allowed to load from it. Unset, no capture image is rendered: the CSP would block it.
 */
export const storageOrigin = process.env.DARKVIEW_STORAGE_ORIGIN
  ? new URL(process.env.DARKVIEW_STORAGE_ORIGIN).origin
  : null;
