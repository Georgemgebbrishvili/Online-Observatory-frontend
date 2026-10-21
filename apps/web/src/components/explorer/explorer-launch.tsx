"use client";

import { useState } from "react";

import type { Locale } from "@/i18n/config";
import { explorerCopy, explorerGameUrl } from "@/i18n/resources/explorer";

/**
 * The game's launch screen: a still from the game behind, the name, one button. A press
 * plays a short warp over the page and then leaves for the game; a modified click or a
 * reduced-motion visitor goes at once.
 */
export function ExplorerLaunch({ locale }: { locale: Locale }) {
  const copy = explorerCopy[locale];
  const [launching, setLaunching] = useState(false);

  function launch(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    setLaunching(true);
    window.setTimeout(() => window.location.assign(explorerGameUrl), 900);
  }

  return (
    <main id="main-content" className="explorer" data-launching={launching || undefined}>
      <div className="explorer-scene" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sky/voyage-earth.webp" alt="" decoding="async" fetchPriority="high" />
        <div className="explorer-warp" />
      </div>

      <div className="explorer-copy">
        <p className="kicker">{copy.kicker}</p>
        <h1 className="explorer-title">
          <span>{copy.title}</span> <em>{copy.titleAccent}</em>
        </h1>
        <p className="explorer-lede">{copy.lede}</p>
        <a
          className="button button-primary button-large explorer-launch"
          href={explorerGameUrl}
          onClick={launch}
          aria-busy={launching || undefined}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M4 2.5v11l9-5.5z" />
          </svg>
          <span>{launching ? copy.launching : copy.launch}</span>
        </a>
        <p className="explorer-note">{copy.note}</p>
        <ul className="explorer-features">
          {copy.features.map((feature) => (
            <li key={feature.title}>
              <b>{feature.title}</b>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="explorer-caption">{copy.caption}</p>
    </main>
  );
}
