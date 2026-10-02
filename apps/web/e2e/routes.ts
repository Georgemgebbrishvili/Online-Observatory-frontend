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
  "app/bookings",
  // Reachable and honest about not being built yet. Phase 1's Done-when.
  "app/book",
  "app/subscription",
  "app/loyalty",
  "app/passes",
] as const;

/**
 * One instance of each parameterised route the suite navigates to. A dynamic segment is
 * compiled on the first request for any of its values, so warming app/collection does
 * not warm app/collection/[captureId]. Warm-up only: these are not shell-contract routes.
 */
export const parameterisedRoutes = [
  "app/missions/saturn",
  // The fake platform's three missions: observing, scheduled, complete.
  "app/missions/20000000-0000-4000-8000-000000000001/session",
  "app/missions/21000000-0000-4000-8000-000000000002/session",
  "app/missions/22000000-0000-4000-8000-000000000003/session",
  // The observing mission's watch page, which its owner is sent on from.
  "app/missions/20000000-0000-4000-8000-000000000001/watch",
  "app/collection/60000000-0000-4000-8000-000000000001",
  // Two of the fake platform's bookings: awaiting payment, and a slot lost to weather.
  "app/bookings/52000000-0000-4000-8000-000000000003",
  "app/bookings/53000000-0000-4000-8000-000000000004",
  // The fake platform's first slot on the night the visual gate's clock is held to.
  "app/book/reserve?startAt=2026-09-25T14:00:00.000Z",
  // The night offered in place of the fake platform's slot lost to the weather.
  "app/book?reschedule=53000000-0000-4000-8000-000000000004",
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
