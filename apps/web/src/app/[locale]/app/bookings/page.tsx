import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BookingList } from "@/components/booking/booking-list";
import { bookingCursorOf, readBookings } from "@/features/booking/bookings";
import { isLocale } from "@/i18n/config";
import { bookingsCopy } from "@/i18n/resources/bookings";
import "@/styles/pages.css";
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

/** The customer's nights, on a page of their own, so the booking board fits one screen. */
export default async function BookingsPage({ params, searchParams }: BookingsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const cursor = bookingCursorOf((await searchParams).cursor);
  const nights = await readBookings(cursor);
  if (nights.kind === "signed-out") redirect(`/${locale}/sign-in`);
  return <BookingList locale={locale} paged={cursor !== null} result={nights} />;
}
