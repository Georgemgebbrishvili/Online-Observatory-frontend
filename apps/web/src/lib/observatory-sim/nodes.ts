/**
 * The simulator's one real site: the first-party observatory in Tbilisi (ADR-003).
 *
 * The coordinates place the simulated sky over the right city; they are never shown.
 * Everything a customer reads about the real instrument comes from the platform.
 */
import type { ObservatoryNode } from "./types";

export const NODES: ObservatoryNode[] = [
  {
    id: "tbilisi-01",
    name: "Tbilisi Observatory",
    site: "Tbilisi, Georgia",
    countryCode: "GE",
    lat: 41.7151,
    lon: 44.8271,
    timezone: "Asia/Tbilisi",
    bortle: 8,
    tier: "first_party",
    status: "commissioning",
    instrument: {
      optics: "150 mm Schmidt-Cassegrain",
      apertureMm: 150,
      focalLengthMm: 1500,
      mount: "Single-fork altazimuth, GoTo",
      camera: "ZWO ASI585MC",
      // 3856 x 2180 at 2.9 um.
      sensorWidthMm: 11.18,
      sensorHeightMm: 6.32,
      pixelSizeUm: 2.9,
      suitedTo: ["Moon", "Planets", "BrightDeepSky"],
    },
    priceGel: 0,
    sessionMinutes: 120,
    availability: { fromHourLocal: 20, toHourLocal: 2 },
  },
];

export function getNode(id: string): ObservatoryNode | null {
  return NODES.find((n) => n.id === id) ?? null;
}
