/**
 * The simulator's one real site: the first-party observatory (ADR-003).
 *
 * The coordinates place the simulated sky over the right city; they are never shown.
 * Everything a customer reads about the real instrument comes from the platform.
 */
import { brand } from "@/brand";

import type { ObservatoryNode } from "./types";

export const NODES: ObservatoryNode[] = [
  {
    id: "tbilisi-01",
    name: `${brand.en.name} Observatory`,
    site: "the observatory",
    countryCode: "GE",
    lat: 41.7151,
    lon: 44.8271,
    timezone: "Asia/Tbilisi",
    bortle: 8,
    tier: "first_party",
    status: "commissioning",
    instrument: {
      optics: "Schmidt-Cassegrain",
      apertureMm: 203,
      focalLengthMm: 2032,
      mount: "Single-fork altazimuth, GoTo",
      camera: "Colour astronomy camera",
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
