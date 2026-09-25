/**
 * The product name, and every form of it a customer can read.
 *
 * "Stellar / სტელარი" is provisional (ADR-025). Georgian declines the name, so one
 * token cannot stand in for it: each sentence names the case it needs. A guard test
 * fails if the name is spelled out anywhere else in `src`.
 *
 * Identifiers — `@darkview/*`, environment variables, cookies — are not the name and
 * stay as they are until the platform renames (ADR-025 Stage B).
 */
export const brand = {
  en: {
    name: "Stellar",
    siteName: "Stellar by Astroman",
    endorsement: "by Astroman",
    maker: "an Astroman product",
    tagline: "The real sky, live.",
  },
  ka: {
    nominative: "სტელარი",
    genitive: "სტელარის",
    dative: "სტელარს",
    on: "სტელარზე",
    endorsement: "Astroman-ისგან",
    maker: "Astroman-ის პროდუქტი",
    tagline: "შენი დრო ნამდვილ ცასთან.",
  },
} as const;
