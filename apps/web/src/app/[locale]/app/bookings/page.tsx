import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BookingList } from "@/components/booking/booking-list";
import { bookingCursorOf, readBookings } from "@/features/booking/bookings";
import { isLocale } from "@/i18n/config";
import { bookingsCopy } from "@/i18n/resources/bookings";
import { requireUser } from "@/lib/platform/session";
import "@/styles/booking.css";

type BookingsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string | string[] }>;
};

export async function generateMetadata({ params }: BookingsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = bookingsCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function BookingsPage({ params, searchParams }: BookingsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const cursor = bookingCursorOf((await searchParams).cursor);
  const result = await readBookings(cursor);
  // The session ended between the check above and the read.
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);

  return <BookingList locale={locale} paged={cursor !== null} result={result} />;
}
