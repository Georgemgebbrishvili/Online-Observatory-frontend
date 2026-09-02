export const appDestinations = [
  { key: "home", segment: "", icon: "home" },
  { key: "missions", segment: "missions", icon: "missions" },
  { key: "live", segment: "live", icon: "live" },
  { key: "collection", segment: "collection", icon: "collection" },
  { key: "profile", segment: "profile", icon: "profile" },
] as const;

export type AppDestination = (typeof appDestinations)[number];
export type AppDestinationKey = AppDestination["key"];
export type NavigationIconName = AppDestination["icon"];

export function isAppDestinationSegment(
  segment: string,
): segment is Exclude<AppDestination["segment"], ""> {
  return appDestinations.some(
    (destination) => destination.segment !== "" && destination.segment === segment,
  );
}
