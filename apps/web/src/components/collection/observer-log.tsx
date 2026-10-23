import type { TargetType } from "@darkview/contracts";

import type { Locale } from "@/i18n/config";
import { observerLogCopy } from "@/i18n/resources/observer-log";
import { targetCopy } from "@/i18n/resources/targets";

export type LogRow = { type: TargetType; seen: number; of: number };

/**
 * Clients ADR-070: a quiet tally, never a badge. Each kind the catalogue offers, and how
 * many of its targets the customer has a capture of.
 */
export function ObserverLog({
  locale,
  rows,
  simulated,
}: {
  locale: Locale;
  rows: LogRow[];
  simulated: boolean;
}) {
  const copy = observerLogCopy[locale];
  const kinds = targetCopy[locale].typesPlural;
  return (
    <section className="observer-log" aria-labelledby="observer-log-title">
      <div className="section-heading">
        <h2 id="observer-log-title">{copy.title}</h2>
        <p className="page-lede">{copy.lede}</p>
      </div>
      <dl className="observer-log-rows">
        {rows.map((row) => (
          <div key={row.type} data-seen={row.seen > 0 || undefined}>
            <dt>{kinds[row.type]}</dt>
            <dd className="data">{copy.seen(row.seen, row.of)}</dd>
          </div>
        ))}
      </dl>
      {simulated && <p className="observer-log-note">{copy.simulated}</p>}
    </section>
  );
}
