import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BookingDetail } from "@/components/booking/booking-detail";
import { PaymentNotice } from "@/components/payment/payment-notice";
import { bookingTitle } from "@/components/booking/booking-list";
import { StatePanel } from "@/components/ui/state-panel";
import { readBooking } from "@/features/booking/bookings";
import { isLocale } from "@/i18n/config";
import { bookingsCopy } from "@/i18n/resources/bookings";
import { requireUser } from "@/lib/platform/session";
import "@/styles/pages.css";
import "@/styles/booking.css";

// Also where the sandbox checkout and Bank of Georgia return the customer (platform
// `bookingReturnUrl`; ADR-073 adds `payment` and `code` when the payment did not go through).
type BookingPageProps = {
  params: Promise<{ locale: string; bookingId: string }>;
  searchParams: Promise<{ payment?: string | string[]; code?: string | string[] }>;
};

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { locale, bookingId } = await params;
  if (!isLocale(locale)) return {};
  const copy = bookingsCopy[locale];
  const result = await readBooking(bookingId);
  return {
    title:
      result.kind === "ok"
        ? `${bookingTitle(result.entry, locale)} · ${copy.metadataTitle}`
        : copy.metadataTitle,
  };
}

/** The request's clock, read outside the render (react-hooks/purity). */
function readClock() {
  return Date.now();
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { locale, bookingId } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const result = await readBooking(bookingId);
  if (result.kind === "not-found") notFound();
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);
  if (result.kind === "unreachable") {
    return (
      <div className="booking-page">
        <StatePanel
          variant="error"
          headingLevel={1}
          {...bookingsCopy[locale].unreachable}
        />
      </div>
    );
  }

  return (
    <>
      <PaymentNotice
        locale={locale}
        query={await searchParams}
        retryHref={`/${locale}/app/book`}
      />
      <BookingDetail entry={result.entry} locale={locale} now={readClock()} />
    </>
  );
}
