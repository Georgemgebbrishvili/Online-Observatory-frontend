/**
 * Every static route the suite exercises, in one place, so the shell contract and the
 * warm-up cannot drift apart.
 */
export const publicRoutes = [
  "",
  "pricing",
  "network",
  "observatory",
  "status",
  "terms",
  "privacy",
  "refunds",
  "design-system",
] as const;

export const appRoutes = [
  "app",
  "app/missions",
  "app/live",
  "app/collection",
  "app/profile",
  // Reachable and honest about not being built yet. Phase 1's Done-when.
  "app/book",
  "app/subscription",
  "app/loyalty",
  "app/passes",
] as const;

/** Only reachable with no session; an authenticated visitor is redirected away. */
export const signedOutRoutes = ["sign-in", "register"] as const;

export const operatorRoutes = [
  "admin",
  "admin/control",
  "admin/missions",
  "admin/targets",
  "admin/logs",
] as const;

export const locales = ["en", "ka"] as const;
