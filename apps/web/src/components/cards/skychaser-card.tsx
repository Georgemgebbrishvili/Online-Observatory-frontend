"use client";

import type { CardRarity } from "@darkview/contracts";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { brand } from "@/brand";
import { cardArt } from "@/features/cards/faces";

export type CardFaceProps = {
  rarity: CardRarity;
  rarityLabel: string;
  /** The target's slug, for its painting; null when it has left the catalogue. */
  slug: string | null;
  name: string;
  kind: string;
  prize: string;
  position: number;
};

type SkychaserCardProps = {
  /** Null while the card is face down: a face-down card carries nothing. */
  face: CardFaceProps | null;
  /** The picked card: it glows in its rarity once turned. */
  picked?: boolean;
  /** The card as a control: turning it. Absent once nothing can be turned. */
  onTurn?: () => void;
  turnLabel?: string;
  busy?: boolean;
  disabled?: boolean;
  caption?: ReactNode;
};

/**
 * Skychaser's card (ADR-058 §1), ported from `~/Desktop/Skychaser/app/src/components/
 * skychaser/card`: the same plate, rim, tier, lean and flip. Our card carries no
 * price, edition or perk; its foot names the prize. Face down it is a plain back with
 * the mark, so nothing on the page gives the answer away before the pick.
 */
export function SkychaserCard({
  busy = false,
  caption,
  disabled = false,
  face,
  onTurn,
  picked = false,
  turnLabel,
}: SkychaserCardProps) {
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const turned = face !== null;

  // One write per frame, against a box measured once per visit (as Skychaser's card).
  const lean = (px: number, py: number, live: boolean) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = stage.current;
      if (!el) return;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
      el.classList.toggle("is-live", live);
    });
  };

  const body = (
    <div
      ref={stage}
      className="sdc-stage"
      onPointerEnter={(event) => {
        box.current = event.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(event) => {
        const r = (box.current ??= event.currentTarget.getBoundingClientRect());
        const px = Math.min(1, Math.max(0, (event.clientX - r.left) / r.width));
        const py = Math.min(1, Math.max(0, (event.clientY - r.top) / r.height));
        lean(turned ? 1 - px : px, py, true);
      }}
      onPointerLeave={() => {
        box.current = null;
        lean(0.5, 0.5, false);
      }}
    >
      <div className="sdc-tilt">
        <div className={`sdc-flip${turned ? " is-over" : ""}`}>
          <div className="sdc-face" aria-hidden={turned}>
            <CardDown busy={busy} />
          </div>
          <div className="sdc-face sdc-face--back" aria-hidden={!turned}>
            {face && <CardFront {...face} />}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <figure
      className={`sdc${picked && turned ? " sdc--picked" : ""}`}
      data-rarity={face?.rarity.toLowerCase()}
    >
      {onTurn && !turned ? (
        <button
          type="button"
          className="sdc-turn"
          onClick={onTurn}
          disabled={disabled || busy}
          aria-label={turnLabel}
          aria-busy={busy || undefined}
        >
          {body}
        </button>
      ) : (
        body
      )}
      {face && (
        <span className="visually-hidden">
          {`${face.rarityLabel}. ${face.name}. ${face.prize}.`}
        </span>
      )}
      {caption && <figcaption className="sdc-caption-line">{caption}</figcaption>}
    </figure>
  );
}

function CardFront({ kind, name, position, prize, rarity, rarityLabel, slug }: CardFaceProps) {
  const art = cardArt(slug);
  return (
    <div className="sdc-card sdc-card--front" data-rarity={rarity.toLowerCase()} data-face={slug ?? undefined}>
      <header className="sdc-top">
        <span className="sdc-no">No. {String(position + 1).padStart(2, "0")}</span>
        <span className="sdc-tier">
          {rarityLabel}
          <i aria-hidden="true" />
        </span>
      </header>
      <div className="sdc-panel">
        <div className={`sdc-art${art ? "" : " sdc-art--plain"}`}>
          {art && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={art} alt="" decoding="async" />
          )}
        </div>
        <div className="sdc-caption">
          <div className="sdc-title">
            <strong
              className="sdc-name"
              style={
                {
                  "--card-name-size": `${Math.max(7, Math.min(10.5, 150 / name.length))}cqw`,
                } as CSSProperties
              }
            >
              {name}
            </strong>
          </div>
          <span className="sdc-kind">{kind}</span>
          <div className="sdc-foot">
            <span className="sdc-perk">{prize}</span>
          </div>
        </div>
      </div>
      <div className="sdc-glare" aria-hidden="true" />
    </div>
  );
}

/** The face-down side: the same plate and rim, the mark, and a field of stars. */
function CardDown({ busy }: { busy: boolean }) {
  return (
    <div className={`sdc-card sdc-card--down${busy ? " is-busy" : ""}`}>
      <div className="sdc-down-sky" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sdc-down-mark" src="/brand/logo-mark.svg" alt="" aria-hidden="true" />
      <span className="sdc-down-word" aria-hidden="true">
        {brand.en.name}
      </span>
      <div className="sdc-glare" aria-hidden="true" />
    </div>
  );
}
