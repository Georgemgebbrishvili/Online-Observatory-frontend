/**
 * The whole authenticated route map, including the parts that do not exist yet.
 *
 * Phase 1's Done-when is that every route in `docs/plan/01-surface-inventory.md` is
 * reachable or says honestly that it is not built. A destination listed here as
 * `planned` gets a real URL and a real navigation entry, and renders a page that says
 * it is not available rather than pretending otherwise. The phase that fills it is
 * recorded here so the list cannot drift from `docs/plan/02-build-phases.md`.
 */

export const appDestinations = [
  { key: "home", segment: "", icon: "home", group: "primary" },
  { key: "missions", segment: "missions", icon: "missions", group: "primary" },
  { key: "live", segment: "live", icon: "live", group: "primary" },
  { key: "collection", segment: "collection", icon: "collection", group: "primary" },
  { key: "profile", segment: "profile", icon: "profile", group: "primary" },
  // Surfaces the platform already supports and nothing calls. See the inventory §3.
  { key: "book", segment: "book", icon: "book", group: "planned", phase: 3 },
  {
    key: "subscription",
    segment: "subscription",
    icon: "subscription",
    group: "planned",
    phase: 5,
  },
  { key: "loyalty", segment: "loyalty", icon: "loyalty", group: "planned", phase: 5 },
  { key: "passes", segment: "passes", icon: "passes", group: "planned", phase: 5 },
] as const;

export type AppDestination = (typeof appDestinations)[number];
export type AppDestinationKey = AppDestination["key"];
export type NavigationIconName = AppDestination["icon"];

/** The five that fit a bottom bar and earn a place in it. */
export const primaryDestinations = appDestinations.filter(
  (destination) => destination.group === "primary",
);

/** Reachable, navigable, and honest about not being built. */
export const plannedDestinations = appDestinations.filter(
  (destination) => destination.group === "planned",
);

/** Segments `/app/[destination]` renders itself, rather than a route of its own. */
const ownRoute = new Set(["", "missions", "live", "collection"]);

export function isAppDestinationSegment(
  segment: string,
): segment is Exclude<AppDestination["segment"], ""> {
  return appDestinations.some(
    (destination) => destination.segment !== "" && destination.segment === segment,
  );
}

export function isPreviewSegment(segment: string) {
  return isAppDestinationSegment(segment) && !ownRoute.has(segment);
}

export function isPlannedSegment(segment: string) {
  return plannedDestinations.some((destination) => destination.segment === segment);
}
