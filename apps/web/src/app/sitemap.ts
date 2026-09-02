import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { siteUrl } from "@/lib/seo";

const publicRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/observatory", changeFrequency: "monthly", priority: 0.8 },
  { path: "/network", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: new URL(`/${locale}${route.path}`, siteUrl).toString(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alternateLocale) => [
            alternateLocale,
            new URL(`/${alternateLocale}${route.path}`, siteUrl).toString(),
          ]),
        ),
      },
    })),
  );
}
