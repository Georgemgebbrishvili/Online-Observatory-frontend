import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BookingBoard } from "@/components/booking/booking-board";
import { PageGuide } from "@/components/guide/page-guide";
import { BookingList } from "@/components/booking/booking-list";
import { RescheduleClosed } from "@/components/booking/reschedule-closed";
import { StatePanel } from "@/components/ui/state-panel";
import { readBoard } from "@/features/booking/board";
import { bookingCursorOf, readBookings } from "@/features/booking/bookings";
import { readReschedule } from "@/features/booking/reschedule";
import { isLocale } from "@/i18n/config";
import { bookingCopy } from "@/i18n/resources/booking";
import { requireUser } from "@/lib/platform/session";
import "@/styles/pages.css";
import "@/styles/booking.css";
import "@/styles/booking-board.css";

type BookPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    startAt?: string | string[];
    reschedule?: string | string[];
    cursor?: string | string[];
  }>;
};

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = bookingCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

/** /app/book is the booking board (ADR-053 §7), with the customer's nights under it (ADR-051). */
export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const { startAt, reschedule: rescheduleParam, cursor: cursorParam } = await searchParams;
  const reschedule = await readReschedule(rescheduleParam);
  if (reschedule.kind === "closed") {
    return <RescheduleClosed bookingId={reschedule.bookingId} locale={locale} />;
  }

  const booking = reschedule.kind === "open" ? reschedule.booking : null;
  const board =
    reschedule.kind === "unreachable"
      ? ({ kind: "unreachable" } as const)
      : await readBoard(
          locale,
          undefined,
          booking?.observatoryId,
          typeof startAt === "string" ? startAt : undefined,
        );
  const copy = bookingCopy[locale];

  let main;
  if (board.kind === "unreachable") {
    main = (
      <div className="booking-page">
        <StatePanel variant="error" headingLevel={1} {...copy.unreachable} />
      </div>
    );
  } else if (board.kind === "no-observatory") {
    main = (
      <div className="booking-page">
        <StatePanel headingLevel={1} {...copy.noObservatory} />
      </div>
    );
  } else {
    main = (
      <BookingBoard
        locale={locale}
        observatory={board.observatory}
        mode={board.mode}
        nights={board.nights}
        targets={board.targets}
        reschedule={booking}
        initialStartAt={typeof startAt === "string" ? startAt : null}
        signInPath={`/${locale}/sign-in`}
      />
    );
  }

  // A reschedule is one night's business; the list waits.
  if (booking) return main;

  // ADR-051: the customer's nights live under the night they are booking.
  const cursor = bookingCursorOf(cursorParam);
  const nights = await readBookings(cursor);
  if (nights.kind === "signed-out") redirect(`/${locale}/sign-in`);
  return (
    <>
      {main}
      <BookingList embedded locale={locale} paged={cursor !== null} result={nights} />
      <PageGuide id="book" locale={locale} />
    </>
  );
}
