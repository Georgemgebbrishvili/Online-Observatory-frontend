import Link from "next/link";

import { targetVisual } from "@/features/targets/present";
import type { VoteCandidate } from "@/features/vote/sky";
import type { Locale } from "@/i18n/config";
import type { VoteCopy } from "@/i18n/resources/vote";
import { targetCopy } from "@/i18n/resources/targets";

type BallotProps = {
  candidates: VoteCandidate[];
  timezone: string;
  locale: Locale;
  copy: VoteCopy["ballot"];
  /** The platform's tally and the caller's vote, once the contract carries them (ADR-053 §8). */
  open: boolean;
};

/** Our drawn plate of a target, where there is one (ADR-052 §7); the rest take a swatch. */
export function plateOf(body: string | null | undefined): string | null {
  const id = body?.toLowerCase();
  return id && ["saturn", "jupiter", "mars", "venus"].includes(id) ? `/plates/${id}.webp` : null;
}

/**
 * The week's ballot (ADR-053 §8): each candidate with its photo or plate, its type, when
 * it is highest, its count and share, and the vote. Until the platform tallies votes the
 * counts are blank and the button says the vote opens with first light.
 */
export function Ballot({ candidates, copy, locale, open, timezone }: BallotProps) {
  const words = targetCopy[locale];
  const clock = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const cast = candidates.reduce((sum, c) => sum + c.votes, 0);
  const lead = Math.max(0, ...candidates.map((c) => c.votes));

  return (
    <>
      <ol className="vote-list">
        {candidates.map((c) => {
          const share = cast ? c.votes / cast : 0;
          const leading = lead > 0 && c.votes === lead;
          const plate = plateOf(c.target.solarSystemBody);
          return (
            <li
              key={c.target.id}
              className={`vote-card vote-card-${targetVisual(c.target)}`}
              data-lead={leading || undefined}
            >
              <Link
                href={`/${locale}/app/missions/${c.target.slug}`}
                className="vote-photo"
                aria-label={copy.targetPage(c.name)}
              >
                {plate && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={plate} alt="" loading="lazy" decoding="async" />
                )}
                {leading && <span className="vote-lead">{copy.leading}</span>}
              </Link>
              <div className="vote-body">
                <div className="vote-head">
                  <h3 className="vote-name">{c.name}</h3>
                  <span className="vote-tag">{words.types[c.target.type]}</span>
                </div>
                <p className="vote-when">
                  {copy.when(Math.round(c.altitudeDeg), clock.format(new Date(c.at)))}
                </p>
                <div className="vote-meta">
                  <span className="vote-count">
                    <b>{c.votes}</b> {copy.votes(c.votes)}
                  </span>
                  <span className="vote-share">{cast ? `${Math.round(share * 100)}%` : "—"}</span>
                </div>
                <span className="vote-bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${share})` }} />
                </span>
                <button
                  type="button"
                  className="button button-secondary button-medium vote-button"
                  disabled={!open}
                  aria-label={open ? copy.voteFor(c.name) : copy.opensSoon}
                >
                  <span>{open ? copy.vote : copy.opensSoon}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="vote-note" role="status">
        {open ? "" : copy.opensNote}
      </p>
    </>
  );
}
