import type { Locale } from "@/i18n/config";

/**
 * Where sign-in may send a visitor instead of `/app`: back to the booking board, at the
 * slot they chose before they had an account (ADR-106). Only that one page of this site
 * in their own language, so `?next=` can never send anyone anywhere else.
 */
export function bookingReturn(value: unknown, locale: Locale): string | null {
  if (typeof value !== "string" || value.length > 300) return null;
  return new RegExp(`^/${locale}/app/book(\\?[A-Za-z0-9=&%:.+_-]*)?$`).test(value)
    ? value
    : null;
}
