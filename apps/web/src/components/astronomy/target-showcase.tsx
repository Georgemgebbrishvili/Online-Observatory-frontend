"use client";

import { useId, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { plateFor } from "@/features/missions/room";
import { showcaseTargets, type ShowcaseTargetId } from "@/features/targets/homepage-data";
import type { HomepageDictionary } from "@/types/homepage";

type TargetShowcaseProps = {
  content: HomepageDictionary["hero"];
  bookHref: string;
  nextHref: string;
  /** On /design-system: a fixed height rather than a screen, and an h2, not the h1. */
  contained?: boolean;
};

/**
 * The homepage hero (ADR-028): one featured target, two more cropped by the screen
 * edges that feature themselves on press. Every plate is present in every slot and only
 * its visibility changes, so a swap never paints the previous planet.
 */
export function TargetShowcase({
  bookHref,
  contained = false,
  content,
  nextHref,
}: TargetShowcaseProps) {
  const [featured, setFeatured] = useState<ShowcaseTargetId>(showcaseTargets[0]);
  const [left, right] = showcaseTargets.filter((target) => target !== featured);
  const titleId = useId();
  const Title = contained ? "h2" : "h1";

  function slot(side: "left" | "right", target: ShowcaseTargetId) {
    const name = content.targets[target].name;
    return (
      <>
        <button
          className="showcase-planet"
          data-side={side}
          type="button"
          aria-label={content.showTarget.replace("{target}", name)}
          onClick={() => setFeatured(target)}
        >
          {showcaseTargets.map((plate) => (
            // Static WebPs from /public at one size: next/image adds nothing.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={plate}
              src={plateFor(plate) ?? undefined}
              alt=""
              width={388}
              height={555}
              hidden={plate !== target}
            />
          ))}
        </button>
        <span className="showcase-label" data-side={side} aria-hidden="true">
          {name}
        </span>
      </>
    );
  }

  return (
    <section
      className="target-showcase"
      data-contained={contained || undefined}
      aria-labelledby={titleId}
    >
      <div className="showcase-sky" aria-hidden="true">
        {showcaseTargets.map((target) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={target}
            src={plateFor(target) ?? undefined}
            alt=""
            width={388}
            height={555}
            data-active={target === featured || undefined}
          />
        ))}
      </div>

      <div className="showcase-copy">
        <p className="showcase-eyebrow">
          <span>{content.eyebrow}</span>
        </p>
        <div aria-live="polite">
          <Title id={titleId} className="showcase-title">
            <span>{content.targets[featured].name}</span>
          </Title>
          <span className="showcase-rule" aria-hidden="true" />
          <p className="showcase-description">{content.targets[featured].description}</p>
        </div>
        <div className="showcase-actions">
          {slot("left", left)}
          <ButtonLink href={bookHref} size="large">
            {content.cta}
          </ButtonLink>
          {slot("right", right)}
        </div>
      </div>

      <footer className="showcase-foot">
        <a className="showcase-next" href={nextHref} aria-label={content.nextSection}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4v16M5 13l7 7 7-7" />
          </svg>
        </a>
        <p className="showcase-caption">{content.illustration}</p>
      </footer>
    </section>
  );
}
