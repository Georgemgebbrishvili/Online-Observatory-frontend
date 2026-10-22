import type { CardDrawOdds, CardPrize } from "@darkview/contracts";
import Link from "next/link";

import { PrizeCode } from "@/components/cards/card-draw";
import type { Locale } from "@/i18n/config";
import { cardsCopy } from "@/i18n/resources/cards";

/** GET /prizes: every prize the account has won, newest first, spent or not. */
export function PrizeList({ locale, prizes }: { locale: Locale; prizes: CardPrize[] | null }) {
  const copy = cardsCopy[locale];
  return (
    <section className="cards-section" aria-labelledby="cards-prizes-title">
      <h2 id="cards-prizes-title">{copy.prizes.title}</h2>
      {prizes === null ? (
        <p className="cards-quiet">{copy.prizes.unreadable}</p>
      ) : prizes.length === 0 ? (
        <p className="cards-quiet">{copy.prizes.empty}</p>
      ) : (
        <ul className="cards-prizes">
          {prizes.map((prize) => (
            <li key={prize.id} className="cards-prize" data-status={prize.status.toLowerCase()}>
              <div className="cards-prize-head">
                <strong>{copy.prize(prize.kind, prize)}</strong>
                <span className="cards-prize-status">{copy.prizes.status[prize.status]}</span>
              </div>
              {prize.status === "ACTIVE" ? (
                <PrizeCode locale={locale} prize={prize} />
              ) : (
                <p className="cards-code-meta">
                  {copy.prizes.code} ···· {prize.codeLast4}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** GET /card-draws/odds, as the deal carries it: the chances and the rules. */
export function CardOdds({ locale, odds }: { locale: Locale; odds: CardDrawOdds }) {
  const copy = cardsCopy[locale];
  const percent = new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    style: "percent",
    maximumFractionDigits: 1,
  });
  const order = ["LEGENDARY", "EPIC", "RARE", "COMMON"] as const;
  const rows = [...odds.cards].sort((a, b) => order.indexOf(a.rarity) - order.indexOf(b.rarity));
  return (
    <section className="cards-section" aria-labelledby="cards-odds-title">
      <h2 id="cards-odds-title">{copy.odds.title}</h2>
      <table className="cards-odds">
        <thead>
          <tr>
            <th scope="col">{copy.odds.rarity}</th>
            <th scope="col">{copy.odds.prize}</th>
            <th scope="col">{copy.odds.chance}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rarity} data-rarity={row.rarity.toLowerCase()}>
              <th scope="row">{copy.rarity[row.rarity]}</th>
              <td>
                {copy.prize(row.prizeKind, {
                  durationMinutes: odds.freeSlotDurationMinutes,
                  percentOff: odds.discountPercentOff,
                })}
              </td>
              <td>{percent.format(row.chance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="cards-rules">
        <li>{copy.odds.cap(odds.freeSlotsPerWeek)}</li>
        <li>{copy.odds.valid(odds.prizeValidDays)}</li>
        <li>{copy.odds.free}</li>
      </ul>
      <Link className="cards-terms" href={`/${locale}/terms#card-draw`}>
        {copy.odds.terms}
      </Link>
    </section>
  );
}
