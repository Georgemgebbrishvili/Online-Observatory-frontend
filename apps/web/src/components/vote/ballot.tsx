"use client";

import { zCastVoteResponse } from "@darkview/contracts/zod";
import Link from "next/link";
import { useState } from "react";

import { targetVisual } from "@/features/targets/present";
import { plateOf } from "@/features/vote/plate";
import type { VoteCandidate } from "@/features/vote/sky";
import type { Locale } from "@/i18n/config";
import { voteCopy } from "@/i18n/resources/vote";
import { targetCopy } from "@/i18n/resources/targets";
import { ApiRequestError, apiRequest } from "@/lib/platform/browser";

type BallotProps = {
  candidates: VoteCandidate[];
  timezone: string;
  locale: Locale;
  /** The platform's ballot (ADR-050): null when it could not be read, and nothing can be cast. */
  ballot: { observatoryId: string; week: string; locksAt: string; mine: string | null } | null;
  signedIn: boolean;
  signInPath: string;
  /** The server's clock at render: the lock is judged against it, then against the browser's. */
  now: string;
};

/**
 * The week's ballot (ADR-053 §8, platform ADR-050): each candidate with its plate or
 * swatch, its type, when it is highest, its count and share, and the vote. A caller's
 * vote shows at once -- their row chosen, the counts moved -- and is put back if the
 * platform refuses it. Casting again for another target moves the vote.
 */
export function Ballot({ ballot, candidates, locale, now, signedIn, signInPath, timezone }: BallotProps) {
  // Looked up here, not passed: the copy holds functions, which cannot cross to a client component.
  const copy = voteCopy[locale].ballot;
  const words = targetCopy[locale];
  const clock = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const [tally, setTally] = useState<Record<string, number>>(() =>
    Object.fromEntries(candidates.map((c) => [c.target.id, c.votes])),
  );
  const [mine, setMine] = useState<string | null>(ballot?.mine ?? null);
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const locked = !!ballot && Date.parse(now) >= Date.parse(ballot.locksAt);
  const open = !!ballot && !locked;

  const moved = (base: Record<string, number>, from: string | null, to: string) => {
    const next = { ...base };
    if (from && from in next) next[from] = Math.max(0, next[from] - 1);
    next[to] = (next[to] ?? 0) + 1;
    return next;
  };

  async function vote(c: VoteCandidate) {
    if (!ballot || pending || mine === c.target.id) return;
    const before = { tally, mine };
    setTally(moved(tally, mine, c.target.id));
    setMine(c.target.id);
    setPending(c.target.id);
    setNote("");
    try {
      const answer = await apiRequest("/votes", {
        method: "POST",
        body: { observatoryId: ballot.observatoryId, week: ballot.week, targetId: c.target.id },
        schema: zCastVoteResponse,
      });
      setTally(Object.fromEntries(answer.candidates.map((x) => [x.targetId, x.votes])));
      setMine(answer.mine);
      setNote(copy.cast(c.name));
    } catch (error) {
      setTally(before.tally);
      setMine(before.mine);
      const code = error instanceof ApiRequestError ? error.error?.code : undefined;
      setNote(
        code === "VOTE_LOCKED"
          ? copy.locked
          : code === "TARGET_NOT_A_CANDIDATE"
            ? copy.notCandidate
            : copy.failed,
      );
    } finally {
      setPending(null);
    }
  }

  const cast = candidates.reduce((sum, c) => sum + (tally[c.target.id] ?? 0), 0);
  const lead = Math.max(0, ...candidates.map((c) => tally[c.target.id] ?? 0));

  return (
    <>
      <ol className="vote-list">
        {candidates.map((c) => {
          const votes = tally[c.target.id] ?? 0;
          const share = cast ? votes / cast : 0;
          const chosen = mine === c.target.id || pending === c.target.id;
          const leading = lead > 0 && votes === lead;
          const plate = plateOf(c.target.solarSystemBody);
          const button = !ballot
            ? copy.opensSoon
            : locked
              ? copy.lockedButton
              : !signedIn
                ? copy.signIn
                : chosen
                  ? copy.yourVote
                  : copy.vote;
          return (
            <li
              key={c.target.id}
              className={`vote-card vote-card-${targetVisual(c.target)}`}
              data-lead={leading || undefined}
              data-mine={chosen || undefined}
              aria-busy={pending === c.target.id || undefined}
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
                    <b>{votes}</b> {copy.votes(votes)}
                  </span>
                  <span className="vote-share">{cast ? `${Math.round(share * 100)}%` : "—"}</span>
                </div>
                <span className="vote-bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${share})` }} />
                </span>
                {open && !signedIn ? (
                  <Link
                    href={signInPath}
                    className="button button-secondary button-medium vote-button"
                    aria-label={copy.signInFor(c.name)}
                  >
                    <span>{button}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={`button ${chosen ? "button-primary" : "button-secondary"} button-medium vote-button`}
                    disabled={!open || (!!pending && !chosen)}
                    aria-pressed={open && signedIn ? chosen : undefined}
                    aria-label={open ? copy.voteFor(c.name) : button}
                    onClick={() => void vote(c)}
                  >
                    <span>{button}</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="vote-note" role="status" aria-live="polite">
        {note || (!ballot ? copy.opensNote : locked ? copy.lockedNote : "")}
      </p>
    </>
  );
}
