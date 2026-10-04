import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingNight } from "@/components/booking/booking-night";
import { RescheduleClosed } from "@/components/booking/reschedule-closed";
import { readNight } from "@/features/booking/read";
import { readReschedule } from "@/features/booking/reschedule";
import { isLocale } from "@/i18n/config";
import { bookingCopy } from "@/i18n/resources/booking";
import { requireUser } from "@/lib/platform/session";
import "@/styles/pages.css";
import "@/styles/booking.css";

type BookPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string | string[]; reschedule?: string | string[] }>;
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

  const { date, reschedule: rescheduleParam } = await searchParams;
  const reschedule = await readReschedule(rescheduleParam);
  if (reschedule.kind === "closed") {
    return <RescheduleClosed bookingId={reschedule.bookingId} locale={locale} />;
  }

  const booking = reschedule.kind === "open" ? reschedule.booking : null;
  const result =
    reschedule.kind === "unreachable"
      ? ({ kind: "unreachable" } as const)
      : await readNight(
          typeof date === "string" ? date : undefined,
          undefined,
          booking?.observatoryId,
        );

  return <BookingNight locale={locale} result={result} reschedule={booking} />;
}
