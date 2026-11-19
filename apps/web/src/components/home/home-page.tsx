import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { fill } from "@/features/operator/format";
import type { Dictionary } from "@/i18n/types";

type Copy = Dictionary["home"]["story"];

export type HomeObject = {
  id: string;
  name: string;
  kind: string;
  note: string;
  image: string;
  time: string;
  high: string;
  glow: string;
  book: { href: string; label: string };
};

export type HomePageProps = {
  copy: Copy;
  hero: Dictionary["home"]["hero"];
  links: {
    book: string;
    watch: string;
    sky: string;
    observatory: string;
    pricing: string;
  };
  objects: HomeObject[];
  session: {
    lengths: { minutes: number; label: string; price: string }[];
    perMinute: string | null;
    cloud: string;
  };
  faq: Dictionary["home"]["more"]["faq"];
  scope: { lede: string; facts: { label: string; value: string }[] };
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Title({
  id,
  title,
  em,
  level = 2,
}: {
  id: string;
  title: string;
  em: string;
  level?: 1 | 2;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <Tag id={id} className="hm-title">
      {title} <em>{em}</em>
    </Tag>
  );
}

function Head({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="hm-head">
      <span className="hm-label">{label}</span>
      {children}
    </div>
  );
}

/** The horizon's lit arc, drawn in CSS. Also a design-system specimen. */
export function HomeHorizon() {
  return (
    <div className="hm-horizon" aria-hidden="true">
      <i />
    </div>
  );
}

/** One of tonight's objects: its picture, when it is best, and the open time nearest. */
export function HomeObjectCard({
  object,
  illustration,
}: {
  object: HomeObject;
  illustration: string;
}) {
  return (
    <article className="hm-object" style={{ "--c": object.glow } as CSSProperties}>
      <figure className="hm-eye">
        {/* A plain <img>: these are small, already sized, and lazy below the fold. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={object.image}
          alt=""
          width={240}
          height={240}
          loading="lazy"
          decoding="async"
        />
        <figcaption className="visually-hidden">{illustration}</figcaption>
      </figure>
      <div className="hm-object-text">
        <span className="hm-label">{object.kind}</span>
        <h3>{object.name}</h3>
        <p>{object.note}</p>
      </div>
      <div className="hm-object-foot">
        <div>
          <b className="hm-data">{object.time}</b>
          <span className="hm-data">{object.high}</span>
        </div>
        <Link className="hm-more" href={object.book.href}>
          {object.book.label} <Arrow />
        </Link>
      </div>
    </article>
  );
}

/**
 * The public homepage (ADR-094): five plain sections, rendered on the server. No pinned
 * scroll, no canvas and no animation library: what it says is worked out by the shell
 * from tonight's almanac and the platform's prices, and the page only lays it out.
 */
export function HomePage({
  copy,
  hero,
  links,
  objects,
  session,
  faq,
  scope,
}: HomePageProps) {
  return (
    <main id="main-content" className="public-home hm">
      <section className="home-hero hm-hero" aria-labelledby="home-title">
        <HomeHorizon />
        <div className="hm-hero-in">
          <h1 id="home-title" className="home-hero-title hm-xl">
            {hero.headline} <span className="hs-accent">{hero.sunset}</span>
          </h1>
          <p className="hm-lede">{hero.lede}</p>
          <div className="home-hero-actions hm-acts">
            <ButtonLink href={links.book} size="large">
              {hero.cta}
            </ButtonLink>
            <ButtonLink href={links.watch} variant="secondary" size="large">
              {hero.watch}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="hm-section hm-how" aria-label={copy.session.label}>
        <ol className="hm-steps">
          {copy.steps.map((step, i) => (
            <li key={step.a}>
              <span className="hm-step-n hm-data">{String(i + 1).padStart(2, "0")}</span>
              <h2>
                {step.a} <em>{step.b}</em>
              </h2>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {objects.length > 0 && (
        <section className="hm-section hm-tonight" aria-labelledby="home-tonight-title">
          <Head label={copy.showpieces.label}>
            <Title
              id="home-tonight-title"
              title={copy.showpieces.title}
              em={copy.showpieces.em}
            />
            <Link className="hm-more" href={links.sky}>
              {copy.showpieces.all} <Arrow />
            </Link>
          </Head>
          <div className="hm-objects">
            {objects.map((object) => (
              <HomeObjectCard
                key={object.id}
                object={object}
                illustration={hero.illustration}
              />
            ))}
          </div>
          <p className="hm-illustration">{hero.illustration}</p>
        </section>
      )}

      <section className="hm-section hm-session" aria-labelledby="home-session-title">
        <div className="hm-price hm-panel">
          <Head label={copy.session.label}>
            <Title
              id="home-session-title"
              title={copy.session.title}
              em={copy.session.em}
            />
          </Head>
          {session.perMinute ? (
            <p className="hm-rate">
              {fill(copy.session.perMinute, { price: session.perMinute })}
            </p>
          ) : (
            <p>{copy.session.noPrice}</p>
          )}
          {session.lengths.length > 0 && (
            <dl className="hm-lengths">
              {session.lengths.map((x) => (
                <div key={x.minutes}>
                  <dt>{x.label}</dt>
                  <dd className="hm-data">{x.price}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="hm-note">{session.cloud}</p>
          <div className="hm-acts">
            <ButtonLink href={links.book}>{hero.cta}</ButtonLink>
            <Link className="hm-more" href={links.pricing}>
              {copy.session.pricing} <Arrow />
            </Link>
          </div>
        </div>
        <div className="hm-faq">
          <h2 className="hm-label">{faq.title}</h2>
          {faq.items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hm-section hm-scope" aria-labelledby="home-scope-title">
        <Head label={copy.scope.label}>
          <Title id="home-scope-title" title={copy.scope.title} em={copy.scope.em} />
        </Head>
        <p className="hm-lede">{scope.lede}</p>
        <dl className="hm-facts">
          {scope.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="hm-label">{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <Link className="hm-more" href={links.observatory}>
          {copy.scope.see} <Arrow />
        </Link>
      </section>

      <section className="hm-section hm-closer" aria-labelledby="home-closer-title">
        <HomeHorizon />
        <div className="hm-closer-in">
          <Title id="home-closer-title" title={copy.closer.title} em={copy.closer.em} />
          <div className="hm-acts">
            <ButtonLink href={links.book} size="large">
              {hero.cta}
            </ButtonLink>
            <ButtonLink href={links.watch} variant="secondary" size="large">
              {hero.watch}
            </ButtonLink>
          </div>
          <p className="hm-credits">{copy.closer.credits}</p>
        </div>
      </section>
    </main>
  );
}
