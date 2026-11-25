import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BookingBoard } from "@/components/booking/booking-board";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatePanel } from "@/components/ui/state-panel";
import { quarterHour, readBoard, sessionMinutes } from "@/features/booking/board";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { bookingCopy } from "@/i18n/resources/booking";
import { getCurrentUser } from "@/lib/platform/session";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/pages.css";
import "@/styles/booking.css";
import "@/styles/booking-board.css";
import "@/styles/target-art.css";
import "@/styles/loyalty.css";

type BookPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = bookingCopy[locale];
  return localizedMetadata({
    locale,
    path: "book",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

/**
 * /book is the booking board for a visitor without an account (ADR-106): the same
 * nights, slots and prices as /app/book, from the platform's public `GET /slots`.
 * Choosing is free; booking asks them to sign in and brings them back to their slot.
 * Someone signed in is sent to /app/book, where their prizes and points are.
 */
export default async function PublicBookPage({ params, searchParams }: BookPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const query = await searchParams;
  const one = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined;
  if (await getCurrentUser()) {
    const kept = new URLSearchParams();
    for (const name of ["startAt", "length", "target"]) {
      const value = one(query[name]);
      if (value) kept.set(name, value);
    }
    redirect(`/${locale}/app/book${kept.size ? `?${kept}` : ""}`);
  }

  const startAt = one(query.startAt);
  const [dictionary, board] = await Promise.all([
    getDictionary(locale),
    readBoard(locale, undefined, undefined, startAt, quarterHour),
  ]);
  const copy = bookingCopy[locale];

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main className="book-public" id="main-content">
        {board.kind === "unreachable" ? (
          <div className="booking-page">
            <StatePanel variant="error" headingLevel={1} {...copy.unreachable} />
          </div>
        ) : board.kind === "no-observatory" ? (
          <div className="booking-page">
            <StatePanel headingLevel={1} {...copy.noObservatory} />
          </div>
        ) : (
          <BookingBoard
            guest
            locale={locale}
            observatory={board.observatory}
            nights={board.nights}
            targets={board.targets}
            reschedule={null}
            durationMinutes={sessionMinutes(one(query.length))}
            initialStartAt={startAt ?? null}
            initialTargetId={
              board.targets.find((candidate) => candidate.slug === one(query.target))?.id ??
              null
            }
            signInPath={`/${locale}/sign-in`}
          />
        )}
      </main>
      <SiteFooter footer={dictionary.footer} locale={locale} path="book" />
    </div>
  );
}
