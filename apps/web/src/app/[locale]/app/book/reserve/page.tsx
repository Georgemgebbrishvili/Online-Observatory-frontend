import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SlotRow } from "@/components/booking/booking-night";
import { ReserveForm } from "@/components/booking/reserve-form";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatePanel } from "@/components/ui/state-panel";
import { readOffer } from "@/features/booking/offer";
import { targetName } from "@/features/targets/present";
import { isLocale } from "@/i18n/config";
import { reserveCopy } from "@/i18n/resources/reserve";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";
import { requireUser } from "@/lib/platform/session";
import "@/styles/booking.css";

type ReservePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ startAt?: string | string[] }>;
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

  const { startAt } = await searchParams;
  const result = await readOffer(typeof startAt === "string" ? startAt : undefined);
  const copy = reserveCopy[locale];
  const targets = targetCopy[locale];
  const night = (date: string | null) =>
    date ? `/${locale}/app/book?date=${date}` : `/${locale}/app/book`;

  return (
    <div className="booking-page reserve-page">
      <Link
        className="booking-back"
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
        <p className="eyebrow">
          <span aria-hidden="true" />
          {result.kind === "ok"
            ? locale === "ka"
              ? result.offer.observatory.nameKa
              : result.offer.observatory.nameEn
            : copy.eyebrow}
        </p>
        <h1>{copy.title}</h1>
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
                copy={copy.form}
              />
              <p className="booking-rule">{copy.note}</p>
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
