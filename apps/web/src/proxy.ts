import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, localeHeader, locales } from "@/i18n/config";
import { sessionCookieName } from "@/lib/platform/config";

function preferredLocale(request: NextRequest) {
  const language = request.headers.get("accept-language")?.toLowerCase();
  return language?.startsWith("ka") ? "ka" : defaultLocale;
}

export function proxy(request: NextRequest) {
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
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();
  const locale = preferredLocale(request);
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|ws/mission/|stream/mission/|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|brand|captures|plates).*)",
  ],
};
