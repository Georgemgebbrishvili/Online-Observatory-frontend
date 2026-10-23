import type { MetadataRoute } from "next";

import { brand } from "@/brand";
import { palette } from "@/styles/tokens";

/** Phase 6.10: the site can be added to a home screen; it opens like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.en.name,
    short_name: brand.en.name,
    description: "One real telescope in Georgia, live.",
    start_url: "/",
    display: "standalone",
    background_color: palette.canvas,
    theme_color: palette.canvas,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
