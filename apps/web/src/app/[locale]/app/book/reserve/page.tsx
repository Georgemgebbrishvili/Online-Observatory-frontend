import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SlotRow } from "@/components/booking/booking-night";
import { ReserveForm } from "@/components/booking/reserve-form";
import { RescheduleClosed } from "@/components/booking/reschedule-closed";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatePanel } from "@/components/ui/state-panel";
import { readOffer } from "@/features/booking/offer";
import { readReschedule } from "@/features/booking/reschedule";
import { targetName } from "@/features/targets/present";
import { isLocale } from "@/i18n/config";
import { rescheduleCopy } from "@/i18n/resources/reschedule";
import { reserveCopy } from "@/i18n/resources/reserve";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";
import { requireUser } from "@/lib/platform/session";
import "@/styles/pages.css";
import "@/styles/booking.css";

type ReservePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ startAt?: string | string[]; reschedule?: string | string[] }>;
};

export async function generateMetadata({ params }: ReservePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: reserveCopy[locale].metadataTitle };
}

export default async function ReservePage({ params, searchParams }: ReservePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const { startAt, reschedule: rescheduleParam } = await searchParams;
  const reschedule = await readReschedule(rescheduleParam);
  if (reschedule.kind === "closed") {
    return <RescheduleClosed bookingId={reschedule.bookingId} locale={locale} />;
  }

  const lost = reschedule.kind === "open" ? reschedule.booking : null;
  const offer =
    reschedule.kind === "unreachable"
      ? ({ kind: "unreachable" } as const)
      : await readOffer(
          typeof startAt === "string" ? startAt : undefined,
          lost?.observatoryId,
        );
  // A replacement is for the lost slot's length (rescheduleBooking).
  const result =
    lost &&
    offer.kind === "ok" &&
    offer.offer.slot.durationMinutes !== lost.durationMinutes
      ? ({ kind: "not-offered", date: offer.offer.date } as const)
      : offer;
  const copy = reserveCopy[locale];
  const replacing = rescheduleCopy[locale];
  const targets = targetCopy[locale];
  const rescheduleQuery = lost ? `reschedule=${encodeURIComponent(lost.id)}` : "";
  const night = (date: string | null) =>
    date
      ? `/${locale}/app/book?date=${date}${rescheduleQuery && `&${rescheduleQuery}`}`
      : `/${locale}/app/book${rescheduleQuery && `?${rescheduleQuery}`}`;

  return (
    <div className="booking-page reserve-page">
      <Link
        className="page-link booking-back"
        href={night(
          result.kind === "ok"
            ? result.offer.date
            : result.kind === "not-offered"
              ? result.date
              : null,
        )}
      >
        {copy.back}
      </Link>

      <header className="booking-hero">
        <p className="kicker">
          {result.kind === "ok"
            ? locale === "ka"
              ? result.offer.observatory.nameKa
              : result.offer.observatory.nameEn
            : copy.eyebrow}
        </p>
        <h1>{copy.title}</h1>
        {lost && <p>{replacing.replacing}</p>}
      </header>

      {result.kind === "unreachable" && (
        <StatePanel variant="error" headingLevel={2} {...copy.unreachable} />
      )}
      {result.kind === "not-offered" && (
        <StatePanel
          headingLevel={2}
          {...copy.notOffered}
          action={
            <Link className="button button-secondary" href={night(result.date)}>
              <span>{copy.form.otherSlot}</span>
            </Link>
          }
        />
      )}

      {result.kind === "ok" && (
        <>
          {result.offer.mode === "SIMULATED" && (
            <ModeNotice
              mode="SIMULATED"
              label={statusCopy[locale].mode.SIMULATED.banner}
              detail={statusCopy[locale].mode.SIMULATED.detail}
            />
          )}

          <ol className="slot-list">
            <SlotRow
              {...result.offer.slot}
              priceLabel={lost ? replacing.free : undefined}
              timezone={result.offer.observatory.timezone}
              locale={locale}
            />
          </ol>

          {result.offer.offered.length === 0 ? (
            <StatePanel
              headingLevel={2}
              {...copy.nothingUp}
              action={
                <Link className="button button-secondary" href={night(result.offer.date)}>
                  <span>{copy.form.otherSlot}</span>
                </Link>
              }
            />
          ) : (
            <>
              <ReserveForm
                observatoryId={result.offer.observatory.id}
                slotStartAt={result.offer.slot.startAt}
                durationMinutes={result.offer.slot.durationMinutes}
                choices={result.offer.offered.map(({ target }) => ({
                  id: target.id,
                  name: targetName(target, locale),
                  detail: [target.catalogId, targets.types[target.type]]
                    .filter(Boolean)
                    .join(" · "),
                }))}
                locale={locale}
                signInPath={`/${locale}/sign-in`}
                copy={
                  lost
                    ? {
                        ...copy.form,
                        reserve: replacing.form.book,
                        reserving: replacing.form.booking,
                        redirecting: replacing.form.booking,
                      }
                    : copy.form
                }
                replacing={
                  lost ? { bookingId: lost.id, targetId: lost.targetId } : undefined
                }
              />
              <p className="booking-rule">{lost ? replacing.note : copy.note}</p>
            </>
          )}

          {result.offer.withheld.length > 0 && (
            <section
              className="reserve-withheld"
              aria-labelledby="reserve-withheld-title"
            >
              <h2 id="reserve-withheld-title">{copy.withheld}</h2>
              <ul>
                {result.offer.withheld.map(({ target, visibility }) => (
                  <li key={target.id}>
                    <span>{targetName(target, locale)}</span>
                    <span>
                      {visibility.observable
                        ? copy.needs(target.expectedMissionMinutes)
                        : visibility.blockReasons
                            .map((reason) => targets.reasons[reason])
                            .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
