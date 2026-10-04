import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BookingDetail } from "@/components/booking/booking-detail";
import { bookingTitle } from "@/components/booking/booking-list";
import { StatePanel } from "@/components/ui/state-panel";
import { readBooking } from "@/features/booking/bookings";
import { isLocale } from "@/i18n/config";
import { bookingsCopy } from "@/i18n/resources/bookings";
import { requireUser } from "@/lib/platform/session";
import "@/styles/pages.css";
import "@/styles/booking.css";

// Also where the sandbox checkout returns the customer (platform `bookingReturnUrl`).
type BookingPageProps = {
  params: Promise<{ locale: string; bookingId: string }>;
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

export default async function BookingPage({ params }: BookingPageProps) {
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

  return <BookingDetail entry={result.entry} locale={locale} mode={result.mode} />;
}
