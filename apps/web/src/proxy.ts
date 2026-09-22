import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, locales } from "@/i18n/config";
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
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const locale = preferredLocale(request);
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|brand|captures).*)",
  ],
};
