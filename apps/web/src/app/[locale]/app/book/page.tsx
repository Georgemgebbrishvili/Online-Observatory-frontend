import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingNight } from "@/components/booking/booking-night";
import { readNight } from "@/features/booking/read";
import { isLocale } from "@/i18n/config";
import { bookingCopy } from "@/i18n/resources/booking";
import { requireUser } from "@/lib/platform/session";
import "@/styles/booking.css";

type BookPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string | string[] }>;
};

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = bookingCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const { date } = await searchParams;
  const result = await readNight(typeof date === "string" ? date : undefined);

  return <BookingNight locale={locale} result={result} />;
}
