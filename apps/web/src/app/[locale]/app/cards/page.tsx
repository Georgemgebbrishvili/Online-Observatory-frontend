import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CardDraw, type CardTargetNames } from "@/components/cards/card-draw";
import { CardOdds, PrizeList } from "@/components/cards/prize-list";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatePanel } from "@/components/ui/state-panel";
import { readCardDraw, readObservatoryMode, readPrizes } from "@/features/cards/read";
import { dayMonth } from "@/features/cards/dates";
import { readCatalogue, readObservatories } from "@/features/collection/read";
import { targetName } from "@/features/targets/present";
import { addDays } from "@/features/vote/sky";
import { isLocale } from "@/i18n/config";
import { cardsCopy } from "@/i18n/resources/cards";
import { targetCopy } from "@/i18n/resources/targets";
import { requireUser } from "@/lib/platform/session";
import "@/styles/skychaser-card.css";
import "@/styles/cards.css";

type CardsPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: CardsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: cardsCopy[locale].metadataTitle } : {};
}

/** The request's clock, read outside the render (react-hooks/purity). */
function readClock() {
  return new Date().toISOString();
}

/**
 * /app/cards (ADR-058): the week's three cards at the first-party observatory, the
 * account's prizes, and the odds. Everything on it is the platform's answer (ADR-060);
 * the page decides nothing.
 */
export default async function CardsPage({ params }: CardsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);
  const copy = cardsCopy[locale];
  const observatories = await readObservatories();
  const observatory = observatories?.find((candidate) => candidate.kind === "FIRST_PARTY");

  const shell = (body: React.ReactNode) => (
    <div className="cards-page">
      <h1 className="visually-hidden">{copy.title}</h1>
      {body}
    </div>
  );

  if (!observatories) {
    return shell(<StatePanel variant="error" headingLevel={2} {...copy.states.unreachable} />);
  }
  if (!observatory) {
    return shell(<StatePanel variant="empty" headingLevel={2} {...copy.states.noObservatory} />);
  }

  const [result, prizes, catalogue, mode] = await Promise.all([
    readCardDraw(observatory.id),
    readPrizes(),
    readCatalogue(),
    readObservatoryMode(observatory.id),
  ]);
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);
  if (result.kind !== "ok") {
    const state =
      result.kind === "not-configured"
        ? copy.states.notConfigured
        : result.kind === "no-observatory"
          ? copy.states.noObservatory
          : copy.states.unreachable;
    return shell(
      <StatePanel
        variant={result.kind === "unreachable" ? "error" : "empty"}
        headingLevel={2}
        {...state}
      />,
    );
  }

  const { draw } = result;
  const words = targetCopy[locale];
  const targets: CardTargetNames = Object.fromEntries(
    [...(catalogue?.values() ?? [])].map((target) => [
      target.slug,
      { name: targetName(target, locale), kind: words.types[target.type] },
    ]),
  );
  const end = addDays(draw.week, 6);
  const range = `${dayMonth(new Date(`${draw.week}T00:00:00Z`), locale)} – ${dayMonth(new Date(`${end}T00:00:00Z`), locale)}`;

  return shell(
    <>
      <header className="cards-head">
        <p className="kicker">{copy.week(range)}</p>
        <p className="cards-lede">{copy.lede}</p>
        {mode === "SIMULATED" && (
          <ModeNotice mode="SIMULATED" label={copy.simulated.label} detail={copy.simulated.detail} />
        )}
      </header>
      <CardDraw
        locale={locale}
        draw={draw}
        targets={targets}
        timezone={observatory.timezone}
        signInPath={`/${locale}/sign-in`}
        now={readClock()}
      />
      <div className="cards-columns">
        <PrizeList locale={locale} prizes={prizes} />
        <CardOdds locale={locale} odds={draw.odds} />
      </div>
    </>,
  );
}
