export const sessionCookieName =
  process.env.NODE_ENV === "production" ? "__Host-darkview_session" : "darkview_session";

export const csrfCookieName =
  process.env.NODE_ENV === "production" ? "__Host-darkview_csrf" : "darkview_csrf";

export const platformApiBaseUrl =
  process.env.DARKVIEW_PLATFORM_API_URL ?? "http://127.0.0.1:4000";
