import path from "node:path";

import type { NextConfig } from "next";

import { platformApiBaseUrl } from "./src/lib/platform/config";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
          },
        ],
      },
    ];
  },
  // ADR-016 §4: the API is served on this host at /api. In production the reverse
  // proxy routes /api before a request reaches this app; in development this
  // rewrite stands in for it, so the API sees this origin and its cookies land here.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${platformApiBaseUrl}/:path*` }];
  },
  turbopack: {
    root: path.join(import.meta.dirname, "../.."),
  },
};

export default nextConfig;
