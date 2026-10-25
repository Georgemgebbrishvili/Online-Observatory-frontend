import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingBoard } from "@/components/booking/booking-board";
import { RescheduleClosed } from "@/components/booking/reschedule-closed";
import { StatePanel } from "@/components/ui/state-panel";
import { quarterHour, readBoard, sessionMinutes } from "@/features/booking/board";
import { readReschedule } from "@/features/booking/reschedule";
import { readPrizes } from "@/features/cards/read";
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
    length?: string | string[];
  }>;
};

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = bookingCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

/** /app/book is the booking board (ADR-074), one screen; the customer's nights are /app/bookings. */
export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const { startAt, reschedule: rescheduleParam, length } = await searchParams;
  const reschedule = await readReschedule(rescheduleParam);
  if (reschedule.kind === "closed") {
    return <RescheduleClosed bookingId={reschedule.bookingId} locale={locale} />;
  }

  const booking = reschedule.kind === "open" ? reschedule.booking : null;
  // ADR-072: the length the address asks for; a replacement keeps its booking's own. It
  // sets what a first tap chooses; the board itself is the night's quarter hours (ADR-074).
  const minutes = booking ? booking.durationMinutes : sessionMinutes(length);
  const board =
    reschedule.kind === "unreachable"
      ? ({ kind: "unreachable" } as const)
      : await readBoard(
          locale,
          undefined,
          booking?.observatoryId,
          typeof startAt === "string" ? startAt : undefined,
          quarterHour,
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
    // ADR-058: the prizes this booking could spend. None for a free replacement.
    const prizes = booking
      ? []
      : ((await readPrizes()) ?? []).filter(
          (prize) =>
            prize.status === "ACTIVE" &&
            prize.kind !== "OBSERVER_SEAT" &&
            prize.observatoryId === board.observatory.id,
        );
    main = (
      <BookingBoard
        prizes={prizes}
        locale={locale}
        observatory={board.observatory}
        nights={board.nights}
        targets={board.targets}
        reschedule={booking}
        durationMinutes={minutes}
        initialStartAt={typeof startAt === "string" ? startAt : null}
        signInPath={`/${locale}/sign-in`}
      />
    );
  }

  return main;
}
