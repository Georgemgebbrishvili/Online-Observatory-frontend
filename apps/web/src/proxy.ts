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
    const isProtectedRoute =
      pathname === `/${locale}/app` || pathname.startsWith(`/${locale}/app/`);
    const isAuthenticationRoute =
      pathname === `/${locale}/sign-in` || pathname === `/${locale}/register`;
    const hasSessionCookie = request.cookies.has(sessionCookieName);

    if (isProtectedRoute && !hasSessionCookie) {
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
    }
    if (isAuthenticationRoute && hasSessionCookie) {
      return NextResponse.redirect(new URL(`/${locale}/app`, request.url));
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
