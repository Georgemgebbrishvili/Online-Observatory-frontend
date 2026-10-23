import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, localeHeader, locales } from "@/i18n/config";
import { platformApiBaseUrl, sessionCookieName } from "@/lib/platform/config";

function preferredLocale(request: NextRequest) {
  const language = request.headers.get("accept-language")?.toLowerCase();
  return language?.startsWith("ka") ? "ka" : defaultLocale;
}

/** `/{locale}/c/{captureId}`: a shared capture's page (ADR-065), not its image. */
const galleryPage = /^\/(en|ka)\/c\/([A-Za-z0-9-]{1,64})$/;

/**
 * Whether a shared capture is there, asked before the page streams (ADR-065 §4). The
 * page sits under a loading boundary, so once it starts it can only answer 200; this is
 * what lets a private, deleted or unknown capture be a real 404. A platform that cannot
 * be asked is not a 404: the page is rendered and says it could not reach it.
 */
async function galleryIsMissing(captureId: string) {
  try {
    const response = await fetch(`${platformApiBaseUrl}/gallery/${captureId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return response.status === 404;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    const locale = pathname.split("/")[1];
    const isProtectedRoute = ["app", "admin"].some(
      (area) =>
        pathname === `/${locale}/${area}` || pathname.startsWith(`/${locale}/${area}/`),
    );
    // A cheap pre-check only. The cookie proves nothing here; the server verifies
    // it with GET /me, and only the server may send a visitor on to /app.
    if (isProtectedRoute && !request.cookies.has(sessionCookieName)) {
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
    }
    // not-found.tsx receives no params, so this is how it learns the language.
    const headers = new Headers(request.headers);
    headers.set(localeHeader, locale);
    const gallery = pathname.match(galleryPage);
    if (gallery && (await galleryIsMissing(gallery[2]))) {
      // A path no route has, so the catch-all renders the not-found page; the status is
      // set here because the page itself streams under a loading boundary.
      const missing = new URL(`/${locale}/c/${gallery[2]}/missing`, request.url);
      return NextResponse.rewrite(missing, { request: { headers }, status: 404 });
    }
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();
  const locale = preferredLocale(request);
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|ws/mission/|stream/mission/|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml|brand|captures|cards/art|plates|sky|monitoring).*)",
  ],
};
