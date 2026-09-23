import path from "node:path";

import type { NextConfig } from "next";

import { platformApiBaseUrl } from "./src/lib/platform/config";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * The previous policy set only base-uri, frame-ancestors and object-src. With no
 * default-src to fall back on, scripts, forms and external loads were unrestricted,
 * so it mitigated nothing beyond clickjacking.
 *
 * `script-src` still allows 'unsafe-inline'. Next's own bootstrap and flight-data
 * scripts are inline, and the alternative -- a per-request nonce from the proxy --
 * requires dynamic rendering on every page (see
 * node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md). This app
 * prerenders 85 static pages, and a nonce in a response header cannot match a nonce
 * baked into prerendered HTML. So this is defence in depth, not XSS immunity: it
 * closes form hijacking, external script and style origins, framing, base-tag
 * rewriting and plugin embedding, and leaves inline script execution open.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // ADR-016 §4: the API is same-origin at /api, so nothing else needs reaching.
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

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
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
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
