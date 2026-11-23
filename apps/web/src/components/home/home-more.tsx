import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { HomepageDictionary } from "@/types/homepage";

type HomeMoreProps = {
  content: HomepageDictionary["more"];
  locale: Locale;
};

// One line drawing per door, set large and faint in its tile.
const glyphs: Record<string, ReactNode> = {
  vote: (
    <>
      <path d="M14 34l8 8 18-22" />
      <rect x="6" y="6" width="52" height="52" rx="10" />
    </>
  ),
  gift: (
    <>
      <rect x="8" y="24" width="48" height="32" rx="4" />
      <path d="M4 16h56v8H4zM32 16v40M32 16c-6-10-18-10-16-2 1 3 8 2 16 2 8 0 15 1 16-2 2-8-10-8-16 2" />
    </>
  ),
  explorer: (
    <>
      <circle cx="32" cy="32" r="9" />
      <ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(-20 32 32)" />
      <circle cx="56" cy="22" r="2.5" />
    </>
  ),
  "app/cards": (
    <>
      <rect x="18" y="6" width="34" height="46" rx="5" transform="rotate(10 35 29)" />
      <rect x="10" y="12" width="34" height="46" rx="5" />
      <path d="M27 26l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" />
    </>
  ),
};

/**
 * ADR-076, ADR-078, ADR-086: the homepage under tonight and the steps — the other ways
 * in, and questions. What a session costs is on the hero's panels and /pricing.
 */
export function HomeMore({ content, locale }: HomeMoreProps) {
  return (
    <>
      <section className="home-band" aria-labelledby="home-ways-title">
        <Container>
          <header className="home-head">
            <h2 id="home-ways-title">{content.ways.title}</h2>
          </header>
          <ul className="home-ways">
            {content.ways.items.map((item) => (
              <li key={item.href}>
                <Link
                  className="home-tile home-way"
                  href={`/${locale}/${item.href}`}
                  data-way={item.href}
                >
                  <svg
                    className="home-way-glyph"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {glyphs[item.href]}
                  </svg>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                  <span className="home-ways-go" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="home-band" aria-labelledby="home-faq-title">
        <Container>
          <div className="home-split home-split-faq">
            <header className="home-head">
              <h2 id="home-faq-title">{content.faq.title}</h2>
            </header>
            <div className="home-faq">
              {content.faq.items.map((item) => (
                <details key={item.q} name="home-faq">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

    </>
  );
}
