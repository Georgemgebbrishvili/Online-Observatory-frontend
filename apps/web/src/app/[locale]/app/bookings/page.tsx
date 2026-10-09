import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { bookingCursorOf } from "@/features/booking/bookings";
import { isLocale } from "@/i18n/config";
import { bookingsCopy } from "@/i18n/resources/bookings";

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

/** ADR-051: the list lives on /app/book as "Your nights"; a bookmark still lands. */
export default async function BookingsPage({ params, searchParams }: BookingsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const cursor = bookingCursorOf((await searchParams).cursor);
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  redirect(`/${locale}/app/book${query}`);
}
