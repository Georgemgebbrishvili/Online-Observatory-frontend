"use client";

import type { TonightSession } from "@darkview/contracts";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LiveIndicator } from "@/components/observatory/live-indicator";
import { Container } from "@/components/ui/container";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { tonightCopy } from "@/i18n/resources/tonight";

/**
 * Clients ADR-066: on the home page, while a session is open to everyone, a line that
 * says so and links to it. Read in the browser, so the home page stays static; nothing
 * is shown until there is something to show, and nothing at all if the read fails.
 */
export function TonightBanner({ locale }: { locale: Locale }) {
  const [live, setLive] = useState<TonightSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    // The reader and the contract's schema arrive with the read, after the page's first
    // paint, so the homepage's first load carries no validator (ADR-104). The response is
    // still checked against the contract before anything is shown.
    Promise.all([import("@/lib/platform/browser"), import("@darkview/contracts/zod")])
      .then(([{ apiRequest }, { zGetTonightResponse }]) =>
        apiRequest("/tonight", { schema: zGetTonightResponse }),
      )
      .then((tonight) => {
        if (!cancelled) setLive(tonight.live ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!live) return null;
  return (
    <Container className="tonight-banner-wrap">
      <TonightBannerView locale={locale} live={live} />
    </Container>
  );
}

export function TonightBannerView({
  label,
  locale,
  live,
}: {
  /** Only where several are on one page, as on /design-system. */
  label?: string;
  locale: Locale;
  live: TonightSession;
}) {
  const copy = tonightCopy[locale];
  const target = locale === "ka" ? live.target.nameKa : live.target.nameEn;
  const line = fill(copy.banner, { target });

  return (
    <aside
      className="tonight-banner"
      aria-label={label ?? copy.title}
      data-tonight-banner=""
    >
      <p>
        {/* The LIVE dot is a real camera's only; a simulated session says so instead. */}
        {live.mode === "REAL" ? (
          <LiveIndicator active label={line} />
        ) : (
          <>
            <span className="capture-simulated">{copy.simulated}</span> {line}
          </>
        )}
      </p>
      <Link className="page-link" href={`/${locale}/tonight`}>
        {copy.bannerAction}
      </Link>
    </aside>
  );
}
